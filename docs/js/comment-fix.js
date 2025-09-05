// Comment Fix - Temporary solution for comment insertion error
// This file ensures comment insertion works properly

// Override the comment insertion if there are any issues
if (typeof window !== 'undefined' && window.forum) {
    // Store the original handleNewComment method
    const originalHandleNewComment = window.forum.handleNewComment;
    
    // Override with a safer version
    window.forum.handleNewComment = async function(e, postId) {
        e.preventDefault();
        
        const content = document.getElementById('commentContent').value.trim();
        if (!content) {
            this.showNotification('Please enter a comment', 'warning');
            return;
        }
        
        try {
            // Create comment object with only the essential fields
            const newComment = {
                post_id: postId,
                user_id: this.currentUser.id,
                content: content,
                created_at: new Date().toISOString()
            };
            
            // Save to Supabase with explicit column specification
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('forum_comments')
                    .insert([newComment])
                    .select()
                    .single();
                
                if (error) {
                    console.error('Comment insertion error:', error);
                    throw error;
                }
                newComment.id = data.id;
            }
            
            // Add to local data
            this.forumData.comments.push(newComment);
            
            // Update post comment count
            const post = this.forumData.posts.find(p => p.id === postId);
            if (post) {
                post.comments_count = (post.comments_count || 0) + 1;
            }
            
            // Reload post details
            this.viewPost(postId);
            
            // Clear form
            e.target.reset();
            
            this.showNotification('Comment added successfully!', 'success');
            this.updateForumStats();
            
        } catch (error) {
            console.error('Failed to add comment:', error);
            this.showNotification('Failed to add comment: ' + error.message, 'error');
        }
    };
    
    console.log('Comment fix applied successfully');
}
