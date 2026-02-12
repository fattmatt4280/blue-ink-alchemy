

## Replace Product Image URL Field with Upload Button

### What Changes

In the **Free Budder Landing Page** editor (admin Pages tab), the current "Product Image URL" text input will be replaced with a proper image upload component. You'll be able to drag-and-drop or click to upload a new product image directly, instead of having to manually paste a URL.

### How It Works

- The existing `ImageUpload` component (already used elsewhere in admin) will be embedded inline in the FreeBudderEditor
- Uploading a new image will store it in the `product-images` storage bucket and automatically update the URL in the editor
- The current image preview will still be shown
- You can still save all changes with the existing Save button

### Technical Details

**File modified: `src/components/FreeBudderEditor.tsx`**

- Import the existing `ImageUpload` component
- Replace the "Product Image URL" text input (lines 172-178) with an `ImageUpload` instance configured with:
  - `bucket="product-images"` (same bucket used for other product images)
  - `currentImage` set to the current `free_budder_product_image` value
  - `onImageUploaded` callback that calls `updateField('free_budder_product_image', url)` to update the state
- Keep it visually compact by embedding it without the Card wrapper (using the upload zone directly) or by using the full `ImageUpload` component in its own section below the text fields

