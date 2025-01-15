import { Request, Response } from "express";
import { getRandomInt, agentGeneratePostLoop, agentLikePostLoop, agentLikeCommentLoop, agentReplyCommentLoop, add_A_Post, add_As_Read, add_A_Comment, getFollowingsAndFollowers, like_A_Comment, dislike_A_Comment, like_A_Post, dislike_A_Post, getInteractionsAgentOnPosts, getInteractionsAgentOnComments, addslashes, getThreadAgentOnComments, delayedFunction, delay } from "../utils";
import { User } from "../models/user/user.model";  // Assuming you have a User model for agent-related data
import { Post } from "../models/post";  // Assuming Post model is imported
import { responseLogger } from "../utils/logger"; // Assuming logger utility
import { Comment } from "../models/comment";  // Assuming Comment model is imported
import { CommentLike } from "../models/commentLike";  // Assuming CommentLike model is imported
import { ObjectId } from "mongodb";  // Import ObjectId for MongoDB 

// Define types for better type safety
interface Agent {
  _id: string;
  name: string;
  followings: string[];
  followers: string[];
  posts: string[];
  comments: string[];
  // Add other properties relevant to your agent here
}

export class SchedulerController {
  // Run the Scheduler and execute actions on random agents
  static async runAction(req: Request, res: Response) {
    try {
      const num_of_loops = 10; // Number of loops for running actions, adjust as needed

      // Fetch all agents from the database
      const agents: Agent[] = await User.find({}); 

      if (!agents.length) {
        return res.status(404).json({ message: "No agents found." });
      }

      for (let i = 0; i < num_of_loops; i++) {
        const randomIndex = getRandomInt(0, agents.length - 1);
        const randomAgent = agents[randomIndex];

        const randAct = getRandomInt(0, 3); // Random action selection
        responseLogger.log(`Action ${i}!`);
        responseLogger.log(`Random Action ${randAct}!`);
        responseLogger.log(`Random Agent: ${JSON.stringify(randomAgent)}!`);

        switch (randAct) {
          case 0:
            await agentGeneratePostLoop(randomAgent); // Generate a post
            // Optionally, you can call more functions like agent_Like_Post_Loop here
            break;

          case 1:
            await agentGeneratePostLoop(randomAgent); // Generate a post
            // Optionally, you can call agent_Like_Comment_Loop here
            break;

          case 2:
            await agentGeneratePostLoop(randomAgent); // Generate a post
            // Optionally, you can call agent_Reply_Comment_Loop here
            break;

          case 3:
            responseLogger.log(randomAgent);
            await agentGeneratePostLoop(randomAgent); // Generate a post
            break;

          default:
            responseLogger.log("Invalid action choice.");
            break;
        }

        // Add additional functions you want to execute as part of each loop
        await delayedFunction(500);  // Example delay (500ms delay between actions)

        // Example of additional actions you could include here
        // These can be customized as per your use case

        // Adding a post
        await add_A_Post(randomAgent);

        // Mark a post as read
        await add_As_Read(randomAgent);

        // Adding a comment to a post
        await add_A_Comment(randomAgent);

        // Fetching followings and followers
        await getFollowingsAndFollowers(randomAgent);

        // Liking a comment
        await like_A_Comment(randomAgent);

        // Disliking a comment
        await dislike_A_Comment(randomAgent);

        // Liking a post
        await like_A_Post(randomAgent);

        // Disliking a post
        await dislike_A_Post(randomAgent);

        // Fetching interactions on posts
        await getInteractionsAgentOnPosts(randomAgent);

        // Fetching interactions on comments
        await getInteractionsAgentOnComments(randomAgent);

        // Processing threaded comments
        await getThreadAgentOnComments(randomAgent);

      }

      return res.status(200).json({ message: "Scheduler actions completed successfully." });
    } catch (error: unknown) {
      console.error("Scheduler Error:", error);

      if (error instanceof Error) {
        return res.status(500).json({ message: "Scheduler Error", error: error.message });
      } else {
        return res.status(500).json({ message: "Scheduler Error", error: "An unknown error occurred" });
      }
    }
  }
  
  // Initialize the scheduler (e.g., connecting to the database and running the scheduler process)
  static async initializeScheduler(req: Request, res: Response) {
    try {
      await connectDB();  // Assuming this connects to MongoDB using your utility

      console.log('MongoDB connected successfully');
      responseLogger.log(`Number of agents: ${agents.length}`);
      responseLogger.log(`List of agents: ${JSON.stringify(agents)}`);

      // Run the scheduler directly or set it to run at intervals
      await this.runAction(req, res); // Running the scheduler actions once

      responseLogger.log(`Scheduler app listening on port ${process.env.network_port}!`);

      return res.status(200).json({ message: 'Scheduler initialized and actions completed.' });
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err);
      return res.status(500).json({ message: 'Failed to initialize scheduler', error: err.message });
    }
  }
  
}

 function add_A_Post(txt: string, userId: string) {
    if (txt.length > 0) {
      const post = new Post({
        desc: txt,
        userId: userId,
        rank: 1000.0,
        pool: "0",
        likes: [],
        dislikes: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      });
      try {
        await post.save();
        responseLogger.log("The post has been added successfully");
      } catch (err) {
        responseLogger.log(`Error adding post: ${err}`);
      }
    } else {
      responseLogger.log("Post text is empty, cannot add post.");
    }
  }

  function add_A_Comment(txt: string, userId: string, postId: string, username: string) {
    if (txt.length > 0) {
      const comment = new Comment({
        body: txt,
        userId: userId,
        postId: postId,
        username: username,
      });
  
      try {
        await comment.save();
        const post = await Post.findById(postId);
        if (post) {
          await post.updateOne({ $push: { comments: comment._id } });
          responseLogger.log("The comment has been added successfully");
        } else {
          responseLogger.log("Post not found");
        }
      } catch (err) {
        responseLogger.log(`Error adding comment: ${err}`);
      }
    } else {
      responseLogger.log("Comment text is empty, cannot add comment.");
    }
  }
  
  
  async function getFollowingsAndFollowers(agentUserId: string) {
    try {
      responseLogger.log("Fetching Followings and Followers");
      const user = await User.findById(agentUserId);
      if (!user) {
        responseLogger.log("User not found");
        return;
      }
  
      const followings = user.followings;
      const followers = user.followers;
      responseLogger.log(`Followings: ${followings.length}`);
      responseLogger.log(`Followers: ${followers.length}`);
  
      const combinedUsers = [...followings, ...followers];
      responseLogger.log(`Total combined users (followings + followers): ${combinedUsers.length}`);
      
      return combinedUsers;
    } catch (err) {
      responseLogger.log(`Error fetching followings and followers: ${err}`);
    }
  }
  
  
  function like_A_Comment(userId: string, commentId: string) {
    try {
      const comment = await Comment.findById(commentId)
        .populate([{ path: "likes", model: "CommentLike", match: { userId: userId } }, 
                   { path: "dislikes", model: "CommentDislike", match: { userId: userId } }])
        .exec();
  
      if (!comment) {
        responseLogger.log("Comment not found");
        return;
      }
  
      let isAlreadyLiked = false;
      let isAlreadyDisliked = false;
  
      // Check if the user has already liked or disliked the comment
      if (comment.likes.length > 0) {
        const likeId = new ObjectId(comment.likes[0]._id);
        isAlreadyLiked = true;
        await Comment.findOneAndUpdate({ _id: commentId }, { $pull: { likes: { _id: likeId } } });
        await CommentLike.findByIdAndDelete(likeId);
        responseLogger.log("Removed like from comment");
      }
  
      if (comment.dislikes.length > 0) {
        const dislikeId = new ObjectId(comment.dislikes[0]._id);
        isAlreadyDisliked = true;
        await Comment.findOneAndUpdate({ _id: commentId }, { $pull: { dislikes: { _id: dislikeId } } });
        await CommentLike.findByIdAndDelete(dislikeId);  // Reusing the CommentLike model for dislikes (assuming same logic)
        responseLogger.log("Removed dislike from comment");
      }
  
      if (!isAlreadyLiked) {
        if (!isAlreadyDisliked) {
          const commentLike = new CommentLike({ userId: userId, commentId: commentId });
          await commentLike.save();
          await comment.updateOne({ $push: { likes: commentLike } });
          responseLogger.log("Liked the comment");
        }
      }
    } catch (err) {
      responseLogger.log(`Error liking comment: ${err}`);
    }
  }


  async function dislike_A_Comment(commentId, userId) {
    const comment = await Comment.findById(commentId)
      .populate([{ path: "likes", model: "CommentLike", match: { "userId": userId } }, { path: "dislikes", model: "CommentDislike", match: { "userId": userId } }])
      .sort({ createdAt: 'descending' }).exec();
  
    let isAlreadyLiked = false;
    let isAlreadyDisliked = false;
  
    if (comment.likes.length > 0) {
      isAlreadyLiked = true;
      try {
        const likeId = new ObjectId(comment.likes[0]._id);
        await Comment.findOneAndUpdate({ _id: commentId }, { $pull: { 'likes': { $in: [likeId] } } });
        await CommentLike.findByIdAndDelete(likeId);
        responseLogger.log("DONE - DISLIKE - 1");
      } catch (err) {
        responseLogger.log(err);
      }
    }
  
    if (comment.dislikes.length > 0) {
      isAlreadyDisliked = true;
      try {
        const dislikeId = new ObjectId(comment.dislikes[0]._id);
        await Comment.findOneAndUpdate({ _id: commentId }, { $pull: { 'dislikes': { $in: [dislikeId] } } });
        await CommentDislike.findByIdAndDelete(dislikeId);
        responseLogger.log("DONE - DISLIKE - 2");
      } catch (err) {
        responseLogger.log(err);
      }
    }
  
    if (!isAlreadyLiked && !isAlreadyDisliked) {
      try {
        const commentDislike = new CommentDislike({ userId, commentId });
        await commentDislike.save();
        await Comment.findByIdAndUpdate(commentId, { $push: { dislikes: commentDislike } });
        responseLogger.log("DONE - DISLIKE - 3");
      } catch (err) {
        responseLogger.log(err);
      }
    }
  }
  
  async function like_A_Post(userId, postId) {
    const post = await Post.findById(postId)
      .populate([{ path: "likes", model: "PostLike", match: { "userId": userId } }, { path: "dislikes", model: "PostDislike", match: { "userId": userId } }])
      .exec();
  
    let isAlreadyLiked = false;
    let isAlreadyDisliked = false;
  
    if (post.likes.length > 0) {
      isAlreadyLiked = true;
      try {
        const likeId = new ObjectId(post.likes[0]._id);
        await Post.findOneAndUpdate({ _id: postId }, { $pull: { 'likes': { $in: [likeId] } } });
        await PostLike.findByIdAndDelete(likeId);
        responseLogger.log("DONE - LIKE - 1");
      } catch (err) {
        responseLogger.log(err);
      }
    }
  
    if (post.dislikes.length > 0) {
      isAlreadyDisliked = true;
      try {
        const dislikeId = new ObjectId(post.dislikes[0]._id);
        await Post.findOneAndUpdate({ _id: postId }, { $pull: { 'dislikes': { $in: [dislikeId] } } });
        await PostDislike.findByIdAndDelete(dislikeId);
        responseLogger.log("DONE - LIKE - 2");
      } catch (err) {
        responseLogger.log(err);
      }
    }
  
    if (!isAlreadyLiked && !isAlreadyDisliked) {
      try {
        const postLike = new PostLike({ userId, postId });
        await postLike.save();
        await Post.findOneAndUpdate({ "_id": postId }, { $push: { likes: postLike } });
        responseLogger.log("DONE - LIKE - 3");
      } catch (err) {
        responseLogger.log(err);
      }
    }
  }
  
  async function dislike_A_Post(postId, userId) {
    const post = await Post.findById(postId)
      .populate([{ path: "likes", model: "PostLike", match: { "userId": userId } }, { path: "dislikes", model: "PostDislike", match: { "userId": userId } }])
      .exec();
  
    let isAlreadyLiked = false;
    let isAlreadyDisliked = false;
  
    if (post.likes.length > 0) {
      isAlreadyLiked = true;
      try {
        const likeId = new ObjectId(post.likes[0]._id);
        await Post.findOneAndUpdate({ _id: postId }, { $pull: { 'likes': { $in: [likeId] } } });
        await PostLike.findByIdAndDelete(likeId);
        responseLogger.log("DONE - DISLIKE - 1");
      } catch (err) {
        responseLogger.log(err);
      }
    }
  
    if (post.dislikes.length > 0) {
      isAlreadyDisliked = true;
      try {
        const dislikeId = new ObjectId(post.dislikes[0]._id);
        await Post.findOneAndUpdate({ _id: postId }, { $pull: { 'dislikes': { $in: [dislikeId] } } });
        await PostDislike.findByIdAndDelete(dislikeId);
        responseLogger.log("DONE - DISLIKE - 2");
      } catch (err) {
        responseLogger.log(err);
      }
    }
  
    if (!isAlreadyLiked && !isAlreadyDisliked) {
      try {
        const postDislike = new PostDislike({ userId, postId });
        await postDislike.save();
        await Post.findByIdAndUpdate(postId, { $push: { dislikes: postDislike } });
        responseLogger.log("DONE - DISLIKE - 3");
      } catch (err) {
        responseLogger.log(err);
      }
    }
  }
  
  async function get_Interactions_Agent_on_Posts(agnt, res) {
    let posts_req = [];
    const posts = await Post.find({ "userId": agnt.userId }).sort({ createdAt: -1 }).limit(5).exec();
    
    posts.forEach(p => {
      posts_req.push({ 'action': "wrote", 'message': p["desc"] });
    });
  
    const postLikes = await PostLike.find({ "userId": agnt.userId }).sort({ createdAt: -1 }).limit(5).exec();
    
    for (const com of postLikes) {
      const po = await Post.find({ "postId": com["postId"] });
      po.forEach(p => {
        posts_req.push({ 'action': "liked", 'message': p["desc"] });
      });
    }
  
    return posts_req;
  }
  
  async function get_Interactions_Agent_on_Comments(agnt) {
    let posts_req = [];
    const comments = await Comment.find({ "userId": agnt._id }).sort({ createdAt: -1 }).limit(5).exec();
  
    comments.forEach(c => {
      posts_req.push({ 'action': "wrote", 'message': c["body"] });
    });
  
    const commentLikes = await CommentLike.find({ "userId": agnt._id }).sort({ createdAt: -1 }).limit(5).exec();
  
    for (const com of commentLikes) {
      const co = await Comment.find({ "_id": com["commentId"] });
      co.forEach(c => {
        posts_req.push({ 'action': "liked", 'message': c["body"] });
      });
    }
  
    return posts_req;
  }
  
  function addslashes(str) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
  }
  
  async function get_thread_Agent_on_Comments(agnt) {
    let posts_thread = [];
    let posts_req = [];
  
    const today = new Date();
    const Fifth_before = new Date();
    Fifth_before.setDate(today.getDate() - 60);
    Fifth_before.setHours(0, 0, 0, 0);
  
    const query = { "createdAt": { $lt: today, $gte: Fifth_before } };
  
    const posts = await Post.find().populate({ path: "comments", model: "Comment" }).sort({ rank: 1 }).limit(1).exec();
  
    for (const post of posts) {
      const post_author = await User.findById(post.userId);
      
      if (post_author) {
        post.comments.forEach(post_com => {
          const msg = { "author": post_com.username, "message": `"${post_com.body.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')}"` };
          posts_req.push(msg);
        });
        if (posts_req.length === 0) {
          posts_req.push({ "author": post_author.username, "message": `"${post.desc.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')}"` });
        }
      }
    }
  
    if (posts_req.length > 0) {
      posts_thread = { "posts": posts_req };
    }
  
    return posts_thread;
  }
  
  function delayedFunction() {
    // Function logic can be added as needed.
  }
  
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  
  async function agent_Like_Comment_Loop(randomAgent) {
    try {
      responseLogger.log("agent_Like_Comment_Loop");
  
      const today = new Date();
      const Ffth_before = new Date();
      Ffth_before.setDate(today.getDate() - 30);
      Ffth_before.setHours(0, 0, 0, 0);
  
      responseLogger.log(randomAgent);
      responseLogger.log(randomAgent.username);
  
      const agnts = await User.find({ username: randomAgent.username });
      const agnt = agnts[0];
  
      if (!agnt) {
        responseLogger.log("Agent not found!");
        return;
      }
  
      const allfofo = await getFollowingsAndFollowers(agnt._id);
      const result = await recommender.fetchAllPosts({ userId: allfofo });
      responseLogger.log("Fetched posts: ", result);
  
      const comments = await Comment.find({
        userId: { $in: allfofo },
        createdAt: { $lt: today, $gte: Ffth_before }
      })
        .sort({ updatedAt: -1 })
        .limit(1);
  
      for (const comment of comments) {
        const usr = await User.findById(comment.userId);
        const pst = await Post.findById(comment.postId);
        
        const msg = { author: usr.username, message: comment.body };
        const interactions = await get_Interactions_Agent_on_Comments(agnt);
        
        const jsn = {
          post: msg,
          history: { interactions },
          integration: { model, provider },
          language: "English",
          persona: [randomAgent.persona],
          platform: "Twitter"
        };
  
        const jsonContent = JSON.stringify(jsn);
        const res = await fetch(`${process.env.AGENTS_URL}like/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "node-fetch"
          },
          body: jsonContent
        }).then(response => response.json());
  
        responseLogger.log(res);
        if (res.response) {
          await like_A_Comment(agnt._id, comment._id);
        }
      }
    } catch (err) {
      responseLogger.log("Error in agent_Like_Comment_Loop:", err);
    }
  }
  
  
  async function agent_Like_Post_Loop(randomAgent) {
    try {
      responseLogger.log("agent_Like_Post_Loop");
  
      const today = new Date();
      const Ffth_before = new Date();
      Ffth_before.setDate(today.getDate() - 30);
      Ffth_before.setHours(0, 0, 0, 0);
  
      const agnts = await User.find({ username: randomAgent.username });
      const agnt = agnts[0];
  
      if (!agnt) {
        responseLogger.log("Agent not found!");
        return;
      }
  
      const allfofo = await getFollowingsAndFollowers(agnt._id);
      const result = await recommender.fetchAllPosts({ userId: allfofo });
      responseLogger.log("Fetched posts: ", result);
  
      const posts = await Post.find({ userId: { $in: allfofo } })
        .populate({ path: "comments", model: "Comment" })
        .sort({ rank: -1 })
        .limit(1);
  
      for (const post of posts) {
        const usr = await User.findById(post.userId);
        const msg = { author: usr.username, message: post.desc };
  
        const interactions = await get_Interactions_Agent_on_Posts(agnt);
        const jsn = {
          post: msg,
          history: { interactions },
          integration: { model, provider },
          language: "English",
          persona: [randomAgent.persona],
          platform: "Twitter"
        };
  
        const jsonContent = JSON.stringify(jsn);
        const res = await fetch(`${process.env.AGENTS_URL}like/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "node-fetch"
          },
          body: jsonContent
        }).then(response => response.json());
  
        responseLogger.log(res);
        if (res.response) {
          await like_A_Post(agnt._id, post._id);
        }
      }
    } catch (err) {
      responseLogger.log("Error in agent_Like_Post_Loop:", err);
    }
  }
  
  
  async function agent_Reply_Comment_Loop(randomAgent) {
    try {
      responseLogger.log("agent_Reply_Comment_Loop");
  
      const today = new Date();
      const Ffth_before = new Date();
      Ffth_before.setDate(today.getDate() - 60);
      Ffth_before.setHours(0, 0, 0, 0);
  
      const agnts = await User.find({ username: randomAgent.username });
      const agnt = agnts[0];
  
      if (!agnt) {
        responseLogger.log("Agent not found!");
        return;
      }
  
      const post = await Post.findOne()
        .populate({ path: "comments", model: "Comment" })
        .sort({ rank: -1 })
        .exec();
  
      if (post) {
        const user = await User.findById(post.userId);
        const interactions = await get_Interactions_Agent_on_Comments(agnt);
        const interact = await get_thread_Agent_on_Comments(agnt);
  
        const jsn = {
          history: { interactions },
          integration: { model, provider },
          language: "English",
          length: "few-word",
          persona: [randomAgent.persona],
          platform: "Twitter",
          thread: interact
        };
  
        const jsonContent = JSON.stringify(jsn);
        responseLogger.log(jsonContent);
  
        const res = await fetch(`${process.env.AGENTS_URL}reply/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "User-Agent": "node-fetch",
            "accept": "application/json"
          },
          body: jsonContent
        });
  
        if (res.ok) {
          const responseData = await res.json();
          responseLogger.log(responseData);
  
          if (responseData.response) {
            await add_A_Comment(responseData.response, agnt._id, POST_ID_REPLY, agnt.username);
          }
        } else {
          responseLogger.log(`Error in fetch: ${res.statusText}`);
        }
      }
    } catch (err) {
      responseLogger.log("Error in agent_Reply_Comment_Loop:", err);
    }
  }
  
  
  async function agent_Generate_Post_Loop(randomAgent) {
    try {
      responseLogger.log("agent_Generate_Post_Loop");
  
      const today = new Date();
      const Ffth_before = new Date();
      Ffth_before.setDate(today.getDate() - 60);
      Ffth_before.setHours(0, 0, 0, 0);
  
      const agnts = await User.find({ username: randomAgent.username });
      const agnt = agnts[0];
  
      if (!agnt) {
        responseLogger.log("Agent not found!");
        return;
      }
  
      const allfofo = await getFollowingsAndFollowers(agnt._id);
      const result = await recommender.fetchAllPosts({ userId: allfofo });
      responseLogger.log("Fetched posts: ", result);
  
      const interactions = await get_Interactions_Agent_on_Comments(agnt);
  
      const jsn = {
        history: { interactions },
        integration: { model, provider },
        language: "English",
        length: "few-word",
        persona: [randomAgent.persona],
        platform: "Twitter",
        topic: topic
      };
  
      const jsonContent = JSON.stringify(jsn);
      responseLogger.log(jsonContent);
  
      const res = await fetch(`${process.env.AGENTS_URL}generate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "User-Agent": "node-fetch"
        },
        body: jsonContent
      }).then(response => response.json());
  
      responseLogger.log(res);
      if (res.response) {
        await add_A_Post(res.response, agnt._id);
      }
    } catch (err) {
      responseLogger.log("Error in agent_Generate_Post_Loop:", err);
    }
  }
  
  
  
  