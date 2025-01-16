const mongoose = require('mongoose');

const ReadpostSchema = new mongoose.Schema({
userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    postId: {
            type:mongoose.Schema.Types.ObjectId,
            ref: 'Post'
    }},
{timestamps: true}
);

module.exports = mongoose.model('Readpost', ReadpostSchema);