import { Document, model, ObjectId, PopulatedDoc, Schema } from 'mongoose'
import { IItem } from './Item'

export interface IInv {
  guildId: string
  userId: string
  item: PopulatedDoc<Document<ObjectId> & IItem>
  amount: number
}

export const inv = new Schema({
  guildId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  item: { type: Schema.Types.ObjectId, ref: 'Item' },
  amount: { type: Number, default: 0 }
})

export const Inv = model<IInv>('Inv', inv)
