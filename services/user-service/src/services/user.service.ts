import db from "../db";


const getAllUsers = async () => {
    const result = await db.query.users.findMany()
    return result;
}


const UserService = {
    getAllUsers,
}

export default UserService