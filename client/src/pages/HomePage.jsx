import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Chatcontainer from '../components/ChatContainer';
import Rightsidebar from '../components/RightSidebar';
import { getUsers } from '../services/messageService';

function HomePage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);         // real users from DB
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    getUsers()
   .then((res) => {
      // make sure it's an array before setting
      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    })
      .catch((err) => 
      {
 console.error(err);
  setUsers([]);
      }
       )
      .finally(() => setLoadingUsers(false));
  }, []);

  return (
    <div className="w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div className="border-2 border-gray-600 backdrop-blur-xl rounded-2xl overflow-hidden h-full">
        {!selectedUser ? (
          <div className="grid grid-cols-[1fr_2fr] h-full overflow-hidden">
            <Sidebar
              users={users}
              loading={loadingUsers}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
            />
            <Chatcontainer selectedUser={selectedUser} />
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_2fr_1fr] h-full overflow-hidden">
            <Sidebar
              users={users}
              loading={loadingUsers}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
            />
            <Chatcontainer selectedUser={selectedUser} />
            <Rightsidebar selectedUser={selectedUser} />
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;