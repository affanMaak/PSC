
export const sendMailMemberAff = (status: "APPROVED" | "REJECTED", member: any, club: any, purpose: string, requestId: number, reqDate: string) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2b3a55;">${club?.name} Visit Request – ${status} (Request ID: ${requestId})</h2>

      <p>Dear ${member?.name || "Member"},</p>

      ${status === "APPROVED" ? `<p>
        Your request to visit <strong>${club?.name}</strong> has been successfully received and Accepted.
      </p>`: `<p>
        Your request to visit <strong>${club?.name}</strong> has been Rejected.
      </p>`}

      <h3 style="margin-top: 20px;">Request Details</h3>
      <ul>
        <li><strong>Request ID:</strong> ${requestId}</li>
        <li><strong>Request Date:</strong> ${reqDate}</li>
        <li><strong>Club:</strong> ${club?.name}</li>
        <li><strong>Purpose of Visit:</strong> ${purpose}</li>
      </ul>

      <p>
        The respective club will review your request and will contact you shortly via 
        <strong>email</strong> or <strong>phone call</strong> with further instructions and confirmation 
        of your visit schedule.
      </p>

      <p>Thank you for your patience.<br/>
      <strong>Peshawar Services Club</strong></p>
    </div>
  `;
};

export const sendMailClubAff = (
  member: any,
  club: any,
  purpose: string,
  requestId: number,
  visitDate: string
) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2b3a55;">Club Visit Request (ID: ${requestId})</h2>

      <p>Dear ${club?.name},</p>

      <p>
        A member from our club has requested to visit your facility.
      </p>

      <h3 style="margin-top: 20px;">Member Details</h3>
      <ul>
        <li><strong>Name:</strong> ${member?.Name}</li>
        <li><strong>Membership No:</strong> ${member?.Membership_No}</li>
        <li><strong>Contact:</strong> ${member?.Email || ""} ${member?.Contact_No ? " / " + member.Contact_No : ""}</li>
      </ul>

      <h3 style="margin-top: 20px;">Visit Request Details</h3>
      <ul>
        <li><strong>Request ID:</strong> ${requestId}</li>
        <li><strong>Requested Club:</strong> ${club?.name}</li>
        <li><strong>Purpose of Visit:</strong> ${purpose}</li>
        <li><strong>Expected Visit Date:</strong> ${visitDate}</li>
      </ul>

      <p>
        Please review the request and contact the member if any additional information is required.
        You may reach out to the member directly using the details provided above.
      </p>

      <p>Thank you.<br/>
      <strong>Peshawar Services Club</strong></p>
    </div>
  `;
};

