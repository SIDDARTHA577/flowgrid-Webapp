import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface UserListProps {
  users: User[];
}

export function UserList({ users }: UserListProps) {
  return (
    <Card className="col-span-full mt-4">
      <CardHeader>
        <CardTitle>All Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center py-4 text-gray-500">No users found.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
