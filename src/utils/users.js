const users = []

//addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room)
    {
        return {
            error: 'Username and room are required!'
        }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser)
    {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

// getUser fun
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

// getUsersInRoom
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}





//Goal: Create two new functions for users
//1. Create getUser
// -Accept id and return user object (or undefined)
//2. Create getUsersInRoom
// -Accept room name and return array of users(for empty array)

// addUser({
//   id: 22,
//   username: 'Rohit',
//   room: 'Ahmedabad',
// });

// addUser({
//   id: 32,
//   username: 'ursololita',
//   room: 'tokyo',
// });

// addUser({
//   id: 42,
//   username: 'professor',
//   room: 'spain',
// });

// const user = getUser(2)
// console.log(user)


// const userList = getUsersInRoom('spain')
// console.log(userList)


// console.log(users)
// const removedUser = removeUser(22)
// console.log(removedUser)
// console.log(users)
