import mongoose,{Schema, mongo} from "mongoose";


const subscriptionSchema=new Schema(
    {
        subscriber:{                    //one who is subscribing the channel
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        channel:{             //one to whom "subscriber" is subscribing
            type
        }

    },{timestamps:true});



export const Subscription=mongoose.model("Subscription",subscriptionSchema)