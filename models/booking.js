import mongoose from "mongoose"

const bookingSchema = mongoose.Schema(
    {
        bookingId :{
            type:Number,
            required :true,
            unique:true
        },
        roomId:{
            type:Number,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        status:{
            type:String,
            required:true,
            default:"Pending"
        },
        reason:{
            type:String,
            default:""
        },
        start:{
            type:Date,
            required:true
        },
        end:{
            type:String,
            required:true
        },
        timeStamp:{
            type:Date,
            default:Date.now
        },
        notes: {
            type: String,
            default: ""
}

    }
)

const Booking = mongoose.model("Bookings",bookingSchema)

export default Booking