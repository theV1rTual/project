export const settings = {
  MONGO_URI: process.env.MONGO_URL || 'mongodb+srv://arystandev_db_user:tB37xiQA2HIAaIi5@cluster0.bjssuw0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  JWT_SECRET: process.env.JWT_SECRET || '123',
  REFRESH_SECRET: process.env.REFRESH_SECRET || '456'
}
