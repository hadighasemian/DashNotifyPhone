"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button, Spinner, TextInput, Table } from "flowbite-react";
import { Icon } from "@iconify/react";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import authModel from "@/resources/models/Auth/AuthModel";
import URLs from "@/resources/Net/URLs";
import { unwrapList, formatDate } from "@/app/components/phonenotify/apiHelpers";
import type { AdminUser } from "@/resources/models/PhoneNotify/types";
import AddUserModal from "@/app/(DashboardLayout)/Users/AddUserModal";
import DeleteModal from "@/app/(DashboardLayout)/Users/DeleteModal";
import { Notify } from "@/app/components/notification/Notification";

export default function UserTable() {
  const { login } = authModel();
  const [data, setData] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});
  const [popupAdd, setPopupAdd] = useState(false);
  const [popupDelete, setPopupDelete] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);

  const load = useCallback(() => {
    if (!login?.token) return;
    const axios = CreateAxiosInstanceServer({ login });
    setLoading(true);
    axios
      .get(URLs.admin.users, { params: { page, per_page: 15, search: search || undefined } })
      .then((res) => {
        const { items, meta: m } = unwrapList<AdminUser>(res);
        setData(items);
        setMeta(m);
      })
      .catch((e) => Notify(e?.message || "Failed to load users", "danger"))
      .finally(() => setLoading(false));
  }, [login?.token, page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const roleLabel = (u: AdminUser) =>
    typeof u.role === "string" ? u.role : u.role?.name || u.role?.title || "admin";

  return (
    <TitleIconCard title="Admin Users">
      <div className="flex flex-wrap gap-3 mb-4 items-center justify-between px-2">
        <TextInput
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="max-w-xs"
        />
        <Button
          color="primary"
          onClick={() => {
            setEditUser(null);
            setPopupAdd(true);
          }}
        >
          <Icon icon="solar:add-circle-line-duotone" className="me-1" />
          Add User
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Role</Table.HeadCell>
              <Table.HeadCell>Created</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {data.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center text-darklink">
                    No users found
                  </Table.Cell>
                </Table.Row>
              ) : (
                data.map((u) => (
                  <Table.Row key={u.id}>
                    <Table.Cell className="font-medium">{u.name}</Table.Cell>
                    <Table.Cell>{u.email}</Table.Cell>
                    <Table.Cell>
                      <Badge color="info">{roleLabel(u)}</Badge>
                    </Table.Cell>
                    <Table.Cell>{formatDate(u.created_at)}</Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Button
                          size="xs"
                          color="light"
                          onClick={() => {
                            setEditUser(u);
                            setPopupAdd(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          color="failure"
                          onClick={() => {
                            setDeleteUser(u);
                            setPopupDelete(true);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      )}
      <div className="flex justify-between items-center mt-4 px-2 text-sm">
        <span>
          Page {meta.current_page || page} / {meta.last_page || 1} · Total {meta.total ?? data.length}
        </span>
        <div className="flex gap-2">
          <Button size="xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <Button
            size="xs"
            disabled={page >= (meta.last_page || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      <AddUserModal
        popupModal={popupAdd}
        setPopupModal={setPopupAdd}
        obj={editUser}
        login={login}
        onSuccess={load}
      />
      <DeleteModal
        popupModal={popupDelete}
        setPopupModal={setPopupDelete}
        obj={deleteUser}
        login={login}
        onSuccess={load}
      />
    </TitleIconCard>
  );
}
