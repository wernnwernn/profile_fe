import api from "../api";

export const listUsers = async () => {
    const { data } = await api.get("/users");
    return data;
};

export const createUser = async (payload) => {
    const { data } = await api.post("/users", payload);
    return data;
};

export const updateUser = async (id, payload) => {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
};
