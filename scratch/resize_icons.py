import PIL.Image as Image
import sys
import os

def resize_image(input_path, output_dir):
    img = Image.open(input_path)
    sizes = [16, 48, 128]
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    for size in sizes:
        resized_img = img.resize((size, size), Image.Resampling.LANCZOS)
        resized_img.save(os.path.join(output_dir, f'icon{size}.png'))
        print(f"Saved icon{size}.png")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python resize_icons.py <path_to_logo>")
        sys.exit(1)
        
    logo_path = sys.argv[1]
    output_dir = r"c:\Desktop\Maskify\extension\icons"
    resize_image(logo_path, output_dir)
