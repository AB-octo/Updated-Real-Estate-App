from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import torch
import clip
from PIL import Image
import numpy as np
import io

# Initialize FastAPI
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the CLIP model
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

# Define valid rooms and junk categories
VALID_ROOMS = [
    "a photo of a bedroom", "a photo of a living room", "a photo of a kitchen",
    "a photo of a bathroom", "a photo of a dining room", "a photo of a home office",
    "a photo of a hallway or corridor", "a photo of a staircase", "a photo of a balcony",
    "a photo of the exterior of a house", "a photo of an apartment building",
    "a photo of a backyard or garden", "a photo of a garage", "a photo of a laundry room",
    "a photo of a walk-in closet", "a photo of a floor plan"
]

JUNK_CATEGORIES = [
    "a screenshot of a website", "a blurry or low quality photo",
    "a photo of a car", "a meme", "a photo of food",
    "a photo of a person", "a person lying in bed",
    "a photo of a gun or weapon", "a firearm",
    "pills, medicine, or drugs", "medical supplies",
    "a messy room with trash", "a dark scary room",
    "a map", "a document", "a selfie", "type of adult content",
    "a photo of a vehicle", "a photo of a handgun or pistol",
    "a rifle or assault weapon", "a person holding a weapon",
    "bullets or ammunition on a surface", "a knife, blade, or sharp weapon",
    "military gear or explosives", "pills, capsules, or medicine bottles",
    "prescription drug packaging", "medical syringes or needles",
    "hospital equipment or medical supplies", "a person taking medicine",
    "illegal drug paraphernalia", "a photo of a human face",
    "a person standing in a room", "a child or baby",
    "a group of people", "a selfie in a mirror",
    "a photo containing people's faces", "adult content or nudity",
    "sexually suggestive pose", "exposed skin or underwear",
    "violent or gory imagery", "a screenshot of a phone or website",
    "a blurry, out of focus, or shaky photo", "a pet, dog, or cat",
    "a meme with text", "a photo of food or a meal",
    "a map or GPS navigation screen", "a document, contract, or paper with text",
    "a close up of an appliance like a toaster or kettle",
    "a trash can or pile of garbage", "a dark, scary, or unlit room",
    "a photo with a heavy watermark or logo"
]

# Combine all labels
ALL_LABELS = VALID_ROOMS + JUNK_CATEGORIES
text_inputs = clip.tokenize(ALL_LABELS).to(device)

def classify_real_estate(image: Image.Image):
    """Classify the uploaded image."""
    image = preprocess(image).unsqueeze(0).to(device)
    with torch.no_grad():
        image_features = model.encode_image(image)
        text_features = model.encode_text(text_inputs)
        logits_per_image, _ = model(image, text_inputs)
        probs = logits_per_image.softmax(dim=-1).cpu().numpy()[0]
    
    results = {ALL_LABELS[i]: float(probs[i]) for i in range(len(ALL_LABELS))}
    real_estate_score = sum(probs[i] for i in range(len(VALID_ROOMS)))
    junk_score = sum(probs[i] for i in range(len(VALID_ROOMS), len(ALL_LABELS)))
    best_label = ALL_LABELS[np.argmax(probs)]
    
    return {
        "score": real_estate_score,
        "is_real_estate": real_estate_score > 0.65,
        "top_label": best_label,
        "junk_score": junk_score
    }

@app.post("/validate/")
async def validate_listing(files: list[UploadFile] = File(...)):
    valid_images = []
    rejected_images = []
    
    for uploaded_file in files:
        image_data = await uploaded_file.read()
        image = Image.open(io.BytesIO(image_data))
        res = classify_real_estate(image)
        
        if res["is_real_estate"]:
            valid_images.append(uploaded_file.filename)
        else:
            rejected_images.append(uploaded_file.filename)
            
    # Summary of results
    if rejected_images:
        return JSONResponse(content={
            "status": "REJECTED",
            "message": f"Detected {len(rejected_images)} invalid images: {', '.join(rejected_images)}."
        })
        
    if not valid_images:
        return JSONResponse(content={
            "status": "REJECTED",
            "message": "No valid real estate photos were found."
        })
        
    return JSONResponse(content={
        "status": "APPROVED",
        "message": "All images are valid real estate photos.",
        "valid_images": valid_images
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
