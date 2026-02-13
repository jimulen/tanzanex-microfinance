"use client";

import { useEffect, useState } from "react";

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [groupName, setGroupName] = useState("");

  const loadData = async () => {
    const g = await fetch("/api/groups").then((r) => r.json());
    const m = await fetch("/api/members").then((r) => r.json());
    setGroups(g);
    setMembers(m);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createGroup = async () => {
    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: groupName }),
    });
    setGroupName("");
    loadData();
  };

  const addMember = async (groupId: string, memberId: string) => {
    await fetch(`/api/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });
    loadData();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Groups</h1>

      {/* Create Group */}
      <div className="mb-6">
        <input
          placeholder="Group Name"
          className="border p-2 mr-2"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <button
          onClick={createGroup}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Create Group
        </button>
      </div>

      {/* Groups List */}
      {groups.map((g) => (
        <div key={g._id} className="border p-4 mb-4 rounded">
          <h2 className="font-semibold">{g.name}</h2>

          <p className="text-sm mt-2">Members:</p>
          <ul className="ml-4 list-disc">
            {g.members.map((m: any) => (
              <li key={m._id}>{m.fullName}</li>
            ))}
          </ul>

          <select
            className="border p-2 mt-2"
            onChange={(e) => addMember(g._id, e.target.value)}
          >
            <option>Add member</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.fullName}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
