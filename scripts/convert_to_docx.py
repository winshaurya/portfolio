import os
import pypandoc

def convert_md_to_docx(src_dir):
    print(f"Searching for .md files in {src_dir}...")
    if not os.path.exists(src_dir):
        print(f"Directory {src_dir} not found.")
        return

    files = [f for f in os.listdir(src_dir) if f.endswith('.md') and f != 'ideas.md']
    
    if not files:
        print("No markdown files found to convert.")
        return

    print(f"Found {len(files)} files to convert.")
    
    for filename in files:
        md_path = os.path.join(src_dir, filename)
        docx_filename = filename.replace('.md', '.docx')
        docx_path = os.path.join(src_dir, docx_filename)
        
        try:
            print(f"Converting {filename} to {docx_filename}...")
            # Using pypandoc to convert directly
            output = pypandoc.convert_file(md_path, 'docx', outputfile=docx_path)
            print(f"Successfully converted: {docx_filename}")
        except Exception as e:
            print(f"Failed to convert {filename}: {e}")

if __name__ == "__main__":
    # Correct path relative to where script is run or absolute path
    dart_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'DART')
    convert_md_to_docx(dart_folder)
