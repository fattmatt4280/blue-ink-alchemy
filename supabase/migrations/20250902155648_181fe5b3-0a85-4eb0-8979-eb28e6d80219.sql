-- Update the blog post with a working placeholder image from Unsplash
UPDATE blog_posts 
SET featured_image = 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    featured_image_alt = 'Professional tattoo aftercare and healing process'
WHERE id = 'a22ea69a-4204-45ff-aa3d-11db3ba52fd6';