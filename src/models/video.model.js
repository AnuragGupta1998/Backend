import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile:{
            type:{           //cloudnary url
                url:String,
                public_id:String
            }, 
            required:true
        },
        thumbnail:{
            type:{          //cloudnary url
                url:String,
                public_id:String
            },  
            required:true, 
        },
        title:{
            type:String, 
            required:true, 
        },
        description:{
            type:String, 
            required:true, 
        },
        duration:{
            type:Number,  //clounary url
            required:true, 
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User "
        }

    },
    {
        timestamps:true
    }
)

//for writting aggregation pipeline in mongoDB..
videoSchema.plugin(mongooseAggregatePaginate)  //it give control on pagination

export const Video = mongoose.model("Video",videoSchema)