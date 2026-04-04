from fastapi import APIRouter
from typing import List, Optional
from pydantic import BaseModel
from models import PostBase
from database import get_collection, create_document, update_document, delete_document

router = APIRouter(prefix="/api/community", tags=["Community"])

class VoteRequest(BaseModel):
    user_id: str
    vote: int  # 1 for upvote, -1 for downvote, 0 to remove vote

class CommentRequest(BaseModel):
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    text: str

@router.get("/", response_model=List[PostBase])
def get_all_posts(sort: str = "votes"):
    docs = get_collection('posts')
    if sort == "recent":
        docs_sorted = sorted(docs, key=lambda x: x.get('created_at', ''), reverse=True)
    else:
        docs_sorted = sorted(docs, key=lambda x: x.get('upvotes', 0), reverse=True)
    return [PostBase(**doc) for doc in docs_sorted]

# Also support /posts path for backwards compat
@router.get("/posts", response_model=List[PostBase])
def get_all_posts_compat(sort: str = "votes"):
    return get_all_posts(sort)

@router.get("/user/{user_id}", response_model=List[PostBase])
def get_user_posts(user_id: str):
    docs = get_collection('posts')
    user_docs = [doc for doc in docs if doc.get('author_uid') == user_id]
    user_docs_sorted = sorted(user_docs, key=lambda x: x.get('created_at', ''), reverse=True)
    return [PostBase(**doc) for doc in user_docs_sorted]

@router.post("/", response_model=PostBase)
def create_post(post: PostBase):
    data = post.model_dump(exclude={'id'})
    data['created_at'] = post.created_at.strftime('%Y-%m-%dT%H:%M:%S')
    data['upvoted_by'] = []
    data['downvoted_by'] = []
    data['comments'] = []
    data['upvotes'] = 0
    new_id = create_document('posts', data)
    post.id = new_id
    return post

# Also support /posts path for backwards compat
@router.post("/posts", response_model=PostBase)
def create_post_compat(post: PostBase):
    return create_post(post)

@router.post("/{post_id}/vote")
def vote_post(post_id: str, payload: VoteRequest):
    docs = get_collection('posts')
    for doc in docs:
        if doc.get("id") == post_id:
            upvoted_by = doc.get("upvoted_by", [])
            downvoted_by = doc.get("downvoted_by", [])

            # Remove any existing vote first
            if payload.user_id in upvoted_by:
                upvoted_by.remove(payload.user_id)
            if payload.user_id in downvoted_by:
                downvoted_by.remove(payload.user_id)

            # Apply new vote
            if payload.vote == 1:
                upvoted_by.append(payload.user_id)
            elif payload.vote == -1:
                downvoted_by.append(payload.user_id)

            net_votes = len(upvoted_by) - len(downvoted_by)
            update_document('posts', post_id, {
                "upvotes": net_votes,
                "upvoted_by": upvoted_by,
                "downvoted_by": downvoted_by
            })
            return {
                "success": True,
                "net_votes": net_votes,
                "upvoted_by": upvoted_by,
                "downvoted_by": downvoted_by
            }

    return {"success": False, "error": "Post not found"}

# Keep legacy upvote endpoint for backwards compat
@router.post("/{post_id}/upvote")
def upvote_post(post_id: str, payload: VoteRequest):
    payload.vote = 1
    return vote_post(post_id, payload)

@router.post("/{post_id}/comments")
def add_comment(post_id: str, payload: CommentRequest):
    import uuid
    from datetime import datetime
    docs = get_collection('posts')
    for doc in docs:
        if doc.get("id") == post_id:
            comments = doc.get("comments", [])
            new_comment = {
                "id": str(uuid.uuid4()),
                "user_id": payload.user_id,
                "user_name": payload.user_name,
                "user_avatar": payload.user_avatar,
                "text": payload.text,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            comments.append(new_comment)
            update_document('posts', post_id, {"comments": comments})
            return {"success": True, "comment": new_comment}

    return {"success": False, "error": "Post not found"}

@router.delete("/{post_id}")
def delete_post(post_id: str):
    success = delete_document("posts", post_id)
    if success:
        return {"success": True}
    return {"success": False, "error": "Post not found"}
