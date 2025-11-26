import axios from "axios";
const base_url = "http://localhost:3000";
// const base_url = "https://psc-production.up.railway.app:3000";

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
      `${base_url}/booking/voucher?bookingId=${bookingId}`,
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

// reserve room
export const reserveRoom = async (
  roomIds: string[],
  reserve: boolean,
  reserveFrom?: string,
  reserveTo?: string
): Promise<any> => {
  try {
    const payload: any = { roomIds, reserve };

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
export const deleteRoom = async (id: string): Promise<any> => {
  try {
    const response = await axios.delete(
      `${base_url}/room/delete/room?id=${id}`,
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

// member api
export const checkAvailRooms = async (
  roomTypeId: any,
  dates: { from: string; to: string }
): Promise<any> => {
  try {
    const response = await axios.post(
      `${base_url}/room/member/check/rooms/available?roomType=${roomTypeId}`,
      dates,
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
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
export const createSport = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(`${base_url}/sport/create/sport`, data, {
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

export const updateSport = async (data: any): Promise<any> => {
  try {
    const response = await axios.patch(`${base_url}/sport/update/sport`, data, {
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