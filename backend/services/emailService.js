// services/emailService.js
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

// Configure OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

const createTransporter = async () => {
  try {
    // Get access token
    const accessToken = await oauth2Client.getAccessToken();

    // Create transporter
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });
  } catch (error) {
    console.error('Error creating transporter:', error);
    throw error;
  }
};

// Function to send verification email
const sendVerificationEmail = async (userEmail, verificationToken) => {
  // Attempt to decode token to determine the type of verification
  let verificationType = 'registration';
  try {
    const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);
    if (decoded.type === 'email-change') {
      verificationType = 'email-change';
    } else if (decoded.type === 'role-update') {
      verificationType = 'role-update';
    }
  } catch (err) {
    // If token decode fails, assume it's a registration verification
    console.warn('Unable to decode verification token:', err);
  }
  
  const backendBase = process.env.BACKEND_URL || 'http://localhost:5000';
  const url = (() => {
    switch (verificationType) {
      case 'email-change':
        return `${backendBase}/api/user/verify-email-change?token=${verificationToken}`;
      case 'role-update':
        return `${backendBase}/api/user/verify-role-update?token=${verificationToken}`;
      default:
        return `${backendBase}/api/auth/verify-email?token=${verificationToken}`;
    }
  })();
  
  const subject = (() => {
    switch (verificationType) {
      case 'email-change':
        return 'Confirm Email Change - Lost & Found System';
      case 'role-update':
        return 'Confirm Role Update - Lost & Found System';
      default:
        return 'Email Verification - Lost & Found System';
    }
  })();

  const htmlContent = (() => {
    switch (verificationType) {
      case 'email-change':
        return `
          <h2>Email Change Confirmation</h2>
          <p>You have requested to change your admin email address in the Lost & Found System.</p>
          <p>Please click the link below to confirm this change:</p>
          <p><a href="${url}">Confirm Email Change</a></p>
          <p>For security, this link will expire in 1 hour.</p>
          <p>If you did not request this change, please ignore this email or contact support.</p>
        `;
      case 'role-update':
        return `
          <h2>Role Update Confirmation</h2>
          <p>Your role in the Lost & Found System is being updated to Security Staff.</p>
          <p>Please click the link below to confirm this change:</p>
          <p><a href="${url}">Confirm Role Update</a></p>
          <p>For security, this link will expire in 1 hour.</p>
          <p>If you did not expect this change, please ignore this email or contact support.</p>
        `;
      default:
        return `<h2>Email Verification</h2>
          <p>Please click the link below to verify your email address:</p>
          <p><a href="${url}">Verify Email Address</a></p>
          <p>For security, this link will expire in 1 hour.</p>`;
    }
  })();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject,
    html: htmlContent,
  };

  try {
    const transporter = await createTransporter();
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Throw so callers (routes) can detect failure and retry/rollback as needed
    throw error;
  }
};

export default sendVerificationEmail;

/**
 * Send email notification when a claim is approved
 */
export const sendClaimApprovedEmail = async (userEmail, claimDetails) => {
  const { claimantName, itemName, itemCategory } = claimDetails;
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:8080';
  const url = `${frontendBase}/notifications`;

  const htmlContent = `
    <h2>✅ Claim Approved!</h2>
    <p>Good news! Your claim has been approved.</p>
    
    <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h3 style="margin-top: 0;">Claim Details:</h3>
      <ul style="margin: 0;">
        <li><strong>Item:</strong> ${itemName || 'N/A'}</li>
        <li><strong>Category:</strong> ${itemCategory || 'General'}</li>
        <li><strong>Status:</strong> Approved</li>
      </ul>
    </div>

    <p><strong>Next Steps:</strong></p>
    <p>Please visit the Security Office to complete the item handover process. Make sure to bring your student ID for verification.</p>

    <p>
      <a href="${url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        View in App
      </a>
    </p>

    <p style="color: #666; font-size: 0.9em;">
      Thank you for using the Lost & Found System. If you have any questions, please contact the Security Office.
    </p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: '✅ Your Claim Has Been Approved - Lost & Found System',
    html: htmlContent,
  };

  try {
    const transporter = await createTransporter();
    await transporter.sendMail(mailOptions);
    console.log('Claim approved email sent successfully to:', userEmail);
  } catch (error) {
    console.error('Error sending claim approved email:', error);
    // Log error but don't throw - in-app notification is more important
  }
};

/**
 * Send email notification when a claim is rejected
 */
export const sendClaimRejectedEmail = async (userEmail, claimDetails) => {
  const { claimantName, itemName, itemCategory } = claimDetails;
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:8080';
  const url = `${frontendBase}/notifications`;

  const htmlContent = `
    <h2>❌ Claim Rejected</h2>
    <p>Unfortunately, your claim has been rejected by the Security Office.</p>
    
    <div style="background-color: #fff5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h3 style="margin-top: 0;">Claim Details:</h3>
      <ul style="margin: 0;">
        <li><strong>Item:</strong> ${itemName || 'N/A'}</li>
        <li><strong>Category:</strong> ${itemCategory || 'General'}</li>
        <li><strong>Status:</strong> Rejected</li>
      </ul>
    </div>

    <p><strong>What Happens Next?</strong></p>
    <p>You may review the claim and resubmit if you believe this decision was incorrect. Please contact the Security Office for more information about why your claim was rejected.</p>

    <p>
      <a href="${url}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        View Details in App
      </a>
    </p>

    <p style="color: #666; font-size: 0.9em;">
      If you have questions about this rejection, please contact the Security Office directly.
    </p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: '❌ Your Claim Has Been Rejected - Lost & Found System',
    html: htmlContent,
  };

  try {
    const transporter = await createTransporter();
    await transporter.sendMail(mailOptions);
    console.log('Claim rejected email sent successfully to:', userEmail);
  } catch (error) {
    console.error('Error sending claim rejected email:', error);
    // Log error but don't throw - in-app notification is more important
  }
};
