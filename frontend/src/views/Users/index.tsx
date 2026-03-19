import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Table,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from "@mui/material";
import { User, Column } from "../../types";
import { fetchUsers } from "../../service/userApi";

export default function Users() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userList, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    }
    loadUsers();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // use the fetched userList directly as the source of truth
  // avoid keeping a stale duplicate state

  const handleEdit = useCallback((row: User) => {
    console.log("edit", row);
  }, []);

  const handleDelete = useCallback((id: number) => {
    setUsers((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const columns = useMemo(
    () =>
      [
        { id: "id", label: "ID" },
        { id: "name", label: "Name" },
        { id: "email", label: "Email" },
        { id: "role", label: "Role" },
        {
          id: "action",
          label: "Action",
          render: (row: User) => (
            <>
              <button onClick={() => handleEdit(row)}>Edit</button>
              <button onClick={() => handleDelete(row.id)}>Delete</button>
            </>
          )
        }
      ] as Column<User>[],
    [handleEdit, handleDelete]
  );

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {userList
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => {
                      if (column.render) {
                        return (
                          <TableCell
                            key={String(column.id)}
                            align={column.align}
                          >
                            {column.render(row as User)}
                          </TableCell>
                        );
                      }

                      const colId = column.id as keyof User;
                      const value = (row as any)[colId];
                      return (
                        <TableCell key={String(column.id)} align={column.align}>
                          {column.format && typeof value === "number"
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={userList.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
