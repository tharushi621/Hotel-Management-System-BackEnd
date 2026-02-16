import express from 'express'
import {getAllBookings, createBooking, deleteBooking, retrieveBookingByDate, createBookingUsingCategory } from '../controllers/bookingController.js'

const bookingRouter= express.Router()

bookingRouter.post("/",createBooking)
bookingRouter.get("/",getAllBookings)
bookingRouter.post("/filter-date",retrieveBookingByDate)
bookingRouter.post("/create-by-category",createBookingUsingCategory)
bookingRouter.delete("/:id", deleteBooking)

export default bookingRouter