import axios from "axios";
// const base_url = "http://localhost:3000/api";
const base_url = "http://193.203.169.122:8080/api";

export const authAdmin = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(`${base_url}/auth/login/admin`, data, {
      withCredentials: true,
      headers: {
        "Client-Type": "web",
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const logout = async () => {
  try {
    const response = await axios.post(
      `${base_url}/auth/logout`,
      {},
      {
        withCredentials: true,
        headers: {
          "Client-Type": "web",
        },
      }
    );
    return response;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const userWho = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/auth/user-who`, {
      withCredentials: true,
      headers: {
        "Client-Type": "web",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error);
  }
};
//////////////////////////////////////////////////////////////////////////////////////////////////////

export const getAdmins = async (): Promise<any> => {
  try {
    const response: { data: any[] } = await axios.get(
      `${base_url}/admin/get/admins`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error);
  }
};
export const createAdmin = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(`${base_url}/auth/create/admin`, data, {
      withCredentials: true,
    });
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const updateAdmin = async ({
  adminID,
  ...updates
}: {
  adminID: any;
  updates: any;
}): Promise<any> => {
  try {
    // console.log(updates)
    const response = await axios.patch(
      `${base_url}/auth/update/admin?adminID=${adminID}`,
      updates,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

export const deleteAdmin = async (adminID: any): Promise<any> => {
  try {
    const response = await axios.delete(
      `${base_url}/auth/remove/admin?adminID=${adminID}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

////////////////////////////////////////// members ///////////////////////////////////////////////////

export const getMembers = async ({
  pageParam = 1,
  search,
  status,
}: {
  pageParam?: number;
  search?: string;
  status?: string;
}): Promise<any> => {
  const params = new URLSearchParams({
    page: pageParam.toString(),
    limit: "50",
  });

  if (search) params.append("search", search);
  if (status) params.append("status", status);

  const res = await axios.get(
    `${base_url}/member/get/members?${params.toString()}`
  );
  if (res.status != 200) throw new Error("Failed to fetch members");
  return res.data;
};

export const createMember = async (data: any) => {
  try {
    const response = await axios.post(
      `${base_url}/member/create/member`,
      data,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const updateMember = async ({
  Membership_No,
  ...updates
}: {
  Membership_No: any;
  updates: any;
}): Promise<any> => {
  try {
    const response = await axios.patch(
      `${base_url}/member/update/member?memberID=${Membership_No}`,
      updates.updates,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const deleteMember = async (memberID: any): Promise<any> => {
  try {
    const response = await axios.delete(
      `${base_url}/member/remove/member?memberID=${memberID}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const createBulkMembers = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(
      `${base_url}/member/create/bulk/members`,
      data,
      { withCredentials: true }
    );
    console.log(response);
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const searchMembers = async (searchString: any): Promise<any> => {
  try {
    const response = await axios.get(
      `${base_url}/member/search/members?searchFor=${searchString}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

// Bookings
export const getBookings = async (bookingsFor: any): Promise<any> => {
  try {
    const response = await axios.get(
      `${base_url}/booking/get/bookings/all?bookingsFor=${bookingsFor}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const createBooking = async (data: any): Promise<any> => {
  // console.log(data)
  try {
    const response = await axios.post(
      `${base_url}/booking/create/booking`,
      data,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    // console.log(error)
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";
    throw { message, status: error.response?.status || 500 };
  }
};
export const updateBooking = async (data: any): Promise<any> => {
  try {
    const response = await axios.patch(
      `${base_url}/booking/update/booking`,
      data,
      { withCredentials: true }
    );
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const deleteBooking = async (
  bookingFor: string,
  bookID: any
): Promise<any> => {
  try {
    const response = await axios.delete(
      `${base_url}/booking/delete/booking?bookingFor=${bookingFor}&bookID=${bookID}`,
      { withCredentials: true }
    );
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

// vouchers
export const getVouchers = async (
  bookingType: string,
  bookingId: any
): Promise<any> => {
  try {
    const response = await axios.get(
      `${base_url}/booking/voucher?bookingId=${bookingId}&bookingType=${bookingType}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

// rooms
export const getRoomTypes = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/room/get/roomTypes`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const createRoomType = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(
      `${base_url}/room/create/roomType`,
      data,
      { withCredentials: true }
    );
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const updateRoomType = async (
  id: string | number,
  data: any
): Promise<any> => {
  try {
    const response = await axios.patch(
      `${base_url}/room/update/roomType?id=${id}`,
      data,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const deleteRoomType = async (id: string | number): Promise<any> => {
  try {
    const response = await axios.delete(
      `${base_url}/room/delete/roomType?id=${id}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
// export const checkAvailRooms = async (id: string | number): Promise<any> => {
//   try {
//     const response = await axios.delete(
//       `${base_url}/room/delete/roomType?id=${id}`,
//       { withCredentials: true }
//     );
//     return response.data;
//   } catch (error: any) {
//     const message =
//       error.response?.data?.message ||
//       error.response?.data?.error ||
//       error.message ||
//       "Something went wrong";

//     throw { message, status: error.response?.status || 500 };
//   }
// };

// reserve room
export const reserveRoom = async (
  roomIds: string[],
  reserve: boolean,
  reserveFrom?: string,
  reserveTo?: string,
  remarks?: string
): Promise<any> => {
  try {
    const payload: any = { roomIds, reserve };

    if (remarks) {
      payload.remarks = remarks;
    }

    // Always include reserveFrom and reserveTo if they are provided
    // The backend needs them to identify which specific reservation to remove
    if (reserveFrom && reserveTo) {
      payload.reserveFrom = reserveFrom;
      payload.reserveTo = reserveTo;
    } else if (reserve) {
      // If reserving and dates are missing, throw error
      throw new Error("Reservation dates are required when reserving rooms");
    }
    // If unreserving and dates are missing, still proceed - backend will handle it

    console.log("Sending payload:", payload); // Debug log

    const response = await axios.patch(
      `${base_url}/room/reserve/rooms`,
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

export const createRoom = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(`${base_url}/room/create/room`, data, {
      withCredentials: true,
    });
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const getAvailRooms = async (roomTypeId: any): Promise<any> => {
  try {
    const response = await axios.get(
      `${base_url}/room/get/rooms/available?roomTypeId=${roomTypeId}`,
      {
        withCredentials: true,
      }
    );
    console.log("available rooms:", response.data);
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const getRoomCategories = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/room/get/rooms/categories`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const getRooms = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/room/get/rooms`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const updateRoom = async (data: any): Promise<any> => {
  try {
    const response = await axios.patch(`${base_url}/room/update/room`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const deleteRoom = async (roomId: string): Promise<any> => {
  try {
    const response = await axios.delete(`${base_url}/room/delete/room?id=${roomId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

export const getRoomLogs = async (
  roomId: number | string,
  from: string,
  to: string
): Promise<any> => {
  try {
    const response = await axios.get(
      `${base_url}/room/logs?roomId=${roomId}&from=${from}&to=${to}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

// dashboard
export const getDashboardStats = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/dashboard/stats`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

export const generateInvoice = async (
  roomTypeId: any,
  bookingDate: any
): Promise<any> => {
  try {
    const response = await axios.post(
      `${base_url}/payment/generate/invoice/room?roomType=${roomTypeId}`,
      bookingDate,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

// checkout/generate voucher
export const generateVoucher = async (
  roomTypeId: any,
  bookingDate: any
): Promise<any> => {
  try {
    const response = await axios.post(
      `${base_url}/payment/generate/invoice/room?roomType=${roomTypeId}`,
      bookingDate,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

//////////////////////////////////////////////////////////////////////////////

// reserve hall
export const reserveHall = async (
  hallIds: string[],
  reserve: boolean,
  timeSlot: string,
  reserveFrom?: string,
  reserveTo?: string,
): Promise<any> => {
  try {
    const payload: any = { hallIds, reserve, timeSlot };

    // Always include reserveFrom and reserveTo if they are provided
    // The backend needs them to identify which specific reservation to remove
    if (reserveFrom && reserveTo) {
      payload.reserveFrom = reserveFrom;
      payload.reserveTo = reserveTo;
    } else if (reserve) {
      // If reserving and dates are missing, throw error
      throw new Error("Reservation dates are required when reserving rooms");
    }
    // If unreserving and dates are missing, still proceed - backend will handle it

    // console.log("Sending payload:", payload); // Debug log

    const response = await axios.patch(
      `${base_url}/hall/reserve/halls`,
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
// halls

export const createHall = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(`${base_url}/hall/create/hall`, data, {
      withCredentials: true,
    });
    // console.log(response.data);
    return response;
  } catch (error: any) {
    // console.log(error)
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const getHallTypes = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/hall/get/halls/available`, {
      withCredentials: true,
    });
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const getHalls = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/hall/get/halls`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const updateHall = async (data: any): Promise<any> => {
  try {
    const response = await axios.patch(`${base_url}/hall/update/hall`, data, {
      withCredentials: true,
    });
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";
    console.log(error);
    throw { message, status: error.response?.status || 500 };
  }
};
export const deleteHall = async (id: string): Promise<any> => {
  try {
    const response = await axios.delete(`${base_url}/hall/delete/hall?hallId=${id}`, {
      withCredentials: true,
    });
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";
    throw { message, status: error.response?.status || 500 };
  }
};

// lawns

export const getLawnCategoriesNames = async (catId: any): Promise<any> => {
  try {
    const response = await axios.get(
      `${base_url}/lawn/get/lawn/categories/names?catId=${catId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const getLawnCategories = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/lawn/get/lawn/categories`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const createLawnCategory = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(
      `${base_url}/lawn/create/lawn/category`,
      data,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const updateLawnCategory = async (data: any): Promise<any> => {
  try {
    const response = await axios.patch(
      `${base_url}/lawn/update/lawn/category`,
      data,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const deleteLawnCategory = async (catID: any): Promise<any> => {
  try {
    const response = await axios.delete(
      `${base_url}/lawn/delete/lawn/category?catID=${catID}`,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

export const createLawn = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(`${base_url}/lawn/create/lawn`, data, {
      withCredentials: true,
    });
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const getAvailableLawns = async (catId: any): Promise<any> => {
  try {
    const response = await axios.get(
      `${base_url}/lawn/get/lawns/available?catId=${catId}`,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const getLawns = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/lawn/get/lawns`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const updateLawn = async (data: any): Promise<any> => {
  try {
    const response = await axios.patch(`${base_url}/lawn/update/lawn`, data, {
      withCredentials: true,
    });
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";
    console.log(error);
    throw { message, status: error.response?.status || 500 };
  }
};
export const deleteLawn = async (id: string): Promise<any> => {
  try {
    const response = await axios.delete(
      `${base_url}/lawn/delete/lawn?id=${id}`,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

// reserve lawn
export const reserveLawn = async (
  lawnIds: number[],
  reserve: boolean,
  timeSlot: string,
  reserveFrom?: string,
  reserveTo?: string,
): Promise<any> => {
  try {
    const payload: any = { lawnIds, reserve, timeSlot };

    if (reserveFrom && reserveTo) {
      payload.reserveFrom = reserveFrom;
      payload.reserveTo = reserveTo;
    } else if (reserve) {
      throw new Error("Reservation dates are required when reserving lawns");
    }

    const response = await axios.patch(
      `${base_url}/lawn/reserve/lawns`,
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

// photoshoot
export const createPhotoshoot = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(
      `${base_url}/photoShoot/create/photoShoot`,
      data,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const getPhotoshootsAvail = async (): Promise<any> => {
  try {
    const response = await axios.get(
      `${base_url}/photoShoot/get/photoShoots/available`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const getPhotoshoots = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/photoShoot/get/photoShoots`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const updatePhotoshoot = async (data: any): Promise<any> => {
  try {
    const response = await axios.patch(
      `${base_url}/photoShoot/update/photoShoot`,
      data,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";
    // console.log(error);
    throw { message, status: error.response?.status || 500 };
  }
};
export const deletePhotoshoot = async (id: any): Promise<any> => {
  try {
    const response = await axios.delete(
      `${base_url}/photoShoot/delete/photoshoot?id=${id}`,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

// sports
export const createSport = async (data: FormData): Promise<any> => {
  try {
    const response = await axios.post(`${base_url}/sport/create/sport`, data, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const getSportsTypes = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/sport/get/sports/names`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const getSportCharges = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/sport/get/sports/names`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};
export const getSports = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/sport/get/sports`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

export const updateSport = async (id: number, data: FormData): Promise<any> => {
  try {
    const response = await axios.patch(`${base_url}/sport/update/sport?id=${id}`, data, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";
    console.log(error);
    throw { message, status: error.response?.status || 500 };
  }
};
export const deleteSport = async (id: string): Promise<any> => {
  try {
    const response = await axios.delete(
      `${base_url}/sport/delete/sport?id=${id}`,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};


//////////////////////////////////////////////////////

// calendar
export const getCalendarRooms = async (): Promise<any> => {
  try {
    const response = await axios.get(
      `${base_url}/room/calendar`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

// ==================== Affiliated Clubs ====================

export const getAffiliatedClubs = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/affiliation/clubs`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch affiliated clubs";

    throw { message, status: error.response?.status || 500 };
  }
};

export const getAffiliatedClubById = async (id: number): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/affiliation/clubs/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch club details";

    throw { message, status: error.response?.status || 500 };
  }
};

export const createAffiliatedClub = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(`${base_url}/affiliation/clubs`, data, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to create club";

    throw { message, status: error.response?.status || 500 };
  }
};

export const updateAffiliatedClub = async (data: any): Promise<any> => {
  try {
    const response = await axios.put(`${base_url}/affiliation/clubs`, data, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to update club";

    throw { message, status: error.response?.status || 500 };
  }
};

export const deleteAffiliatedClub = async (id: number): Promise<any> => {
  try {
    const response = await axios.delete(`${base_url}/affiliation/clubs/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to delete club";

    throw { message, status: error.response?.status || 500 };
  }
};

// ==================== Affiliated Club Requests ====================

export const getAffiliatedClubRequests = async (status?: string): Promise<any> => {
  try {
    const url = status
      ? `${base_url}/affiliation/requests?status=${status}`
      : `${base_url}/affiliation/requests`;
    const response = await axios.get(url, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch requests";

    throw { message, status: error.response?.status || 500 };
  }
};

export const getAffiliatedClubRequestById = async (id: number): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/affiliation/requests/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch request details";

    throw { message, status: error.response?.status || 500 };
  }
};

export const createAffiliatedClubRequest = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(`${base_url}/affiliation/requests`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to create request";

    throw { message, status: error.response?.status || 500 };
  }
};

export const updateAffiliatedClubRequestStatus = async (data: { id: number, status: string }): Promise<any> => {
  try {
    const response = await axios.patch(
      `${base_url}/affiliation/request/action?requestId=${data.id}&status=${data.status}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to update request status";

    throw { message, status: error.response?.status || 500 };
  }
};

export const deleteAffiliatedClubRequest = async (id: number): Promise<any> => {
  try {
    const response = await axios.delete(`${base_url}/affiliation/requests/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to delete request";

    throw { message, status: error.response?.status || 500 };
  }
};



// member bookings
export const memberBookings = async (type: string, membership_no: string): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/booking/member/bookings/all?type=${type}&membership_no=${membership_no}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to delete request";

    throw { message, status: error.response?.status || 500 };
  }
};

////////////////////////// CONTENT //////////////////////////

// Events
export const createEvent = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(`${base_url}/content/events`, data, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error creating event", status: error.response?.status || 500 }; }
};
export const getEvents = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/content/events`, { withCredentials: true });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error fetching events", status: error.response?.status || 500 }; }
};
export const updateEvent = async ({ id, data }: { id: any, data: any }): Promise<any> => {
  try {
    const response = await axios.put(`${base_url}/content/events/${id}`, data, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error updating event", status: error.response?.status || 500 }; }
};
export const deleteEvent = async (id: any): Promise<any> => {
  try {
    const response = await axios.delete(`${base_url}/content/events/${id}`, { withCredentials: true });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error deleting event", status: error.response?.status || 500 }; }
};

// Club Rules
export const createRule = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(`${base_url}/content/rules`, data, { withCredentials: true });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error creating rule", status: error.response?.status || 500 }; }
};
export const getRules = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/content/rules`, { withCredentials: true });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error fetching rules", status: error.response?.status || 500 }; }
};
export const updateRule = async ({ id, data }: { id: any, data: any }): Promise<any> => {
  try {
    const response = await axios.put(`${base_url}/content/rules/${id}`, data, { withCredentials: true });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error updating rule", status: error.response?.status || 500 }; }
};
export const deleteRule = async (id: any): Promise<any> => {
  try {
    const response = await axios.delete(`${base_url}/content/rules/${id}`, { withCredentials: true });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error deleting rule", status: error.response?.status || 500 }; }
};

// Announcements
export const createAnnouncement = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(`${base_url}/content/announcements`, data, { withCredentials: true });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error creating announcement", status: error.response?.status || 500 }; }
};
export const getAnnouncements = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/content/announcements`, { withCredentials: true });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error fetching announcements", status: error.response?.status || 500 }; }
};
export const updateAnnouncement = async ({ id, data }: { id: any, data: any }): Promise<any> => {
  try {
    const response = await axios.put(`${base_url}/content/announcements/${id}`, data, { withCredentials: true });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error updating announcement", status: error.response?.status || 500 }; }
};
export const deleteAnnouncement = async (id: any): Promise<any> => {
  try {
    const response = await axios.delete(`${base_url}/content/announcements/${id}`, { withCredentials: true });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error deleting announcement", status: error.response?.status || 500 }; }
};

// About Us
export const upsertAboutUs = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(`${base_url}/content/about-us`, data, { withCredentials: true });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error saving about us", status: error.response?.status || 500 }; }
};
export const getAboutUs = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/content/about-us`, { withCredentials: true });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error fetching about us", status: error.response?.status || 500 }; }
};

// Club History
export const createHistory = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(`${base_url}/content/history`, data, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error creating history", status: error.response?.status || 500 }; }
};
export const getHistory = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/content/history`, { withCredentials: true });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error fetching history", status: error.response?.status || 500 }; }
};
export const updateHistory = async ({ id, data }: { id: any, data: any }): Promise<any> => {
  try {
    const response = await axios.put(`${base_url}/content/history/${id}`, data, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error updating history", status: error.response?.status || 500 }; }
};
export const deleteHistory = async (id: any): Promise<any> => {
  try {
    const response = await axios.delete(`${base_url}/content/history/${id}`, { withCredentials: true });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error deleting history", status: error.response?.status || 500 }; }
};

// Promotional Ads
export const createAd = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(`${base_url}/content/ads`, data, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error creating ad", status: error.response?.status || 500 }; }
};
export const getAds = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/content/ads`, { withCredentials: true });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error fetching ads", status: error.response?.status || 500 }; }
};
export const updateAd = async ({ id, data }: { id: any, data: any }): Promise<any> => {
  try {
    const response = await axios.put(`${base_url}/content/ads/${id}`, data, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error updating ad", status: error.response?.status || 500 }; }
};
export const deleteAd = async (id: any): Promise<any> => {
  try {
    const response = await axios.delete(`${base_url}/content/ads/${id}`, { withCredentials: true });
    return response.data;
  } catch (error: any) { throw { message: error.response?.data?.message || "Error deleting ad", status: error.response?.status || 500 }; }
};

/////////////////////////////////////////////////


// Notifications
export const sendNotification = async (payload: any): Promise<any> => {
  try {
    const response = await axios.post(`${base_url}/notification/send-msg`, { payload }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    throw { message, status: error.response?.status || 500 };
  }
};

// Accounts
export const getAccountMembers = async (): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/member/get/members?page=1&limit=1000`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    throw { message: error.response?.data?.message || "Error fetching members", status: error.response?.status || 500 };
  }
};

export const getMemberVouchers = async (membershipNo: string): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/payment/member/vouchers?membershipNo=${membershipNo}`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    throw { message: error.response?.data?.message || "Error fetching vouchers", status: error.response?.status || 500 };
  }
};

export const getMemberBookings = async (membershipNo: string): Promise<any> => {
  try {
    const response = await axios.get(`${base_url}/booking/member/bookings?membershipNo=${membershipNo}`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    throw { message: error.response?.data?.message || "Error fetching bookings", status: error.response?.status || 500 };
  }
};
