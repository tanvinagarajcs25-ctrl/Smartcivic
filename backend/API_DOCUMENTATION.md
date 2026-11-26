# Smart Civic – Backend API Documentation

Base URL: `http://localhost:3000`

## 1. Submit Complaint

- Method: POST
- Endpoint: `/api/complaints`
- Content-Type: `application/json`

Required fields:
- category
- description
- location

Optional fields:
- latitude
- longitude

Response includes:
- ticketId
- complaint details
- status

## 2. Submit Complaint with Image

- Method: POST
- Endpoint: `/api/complaints`
- Content-Type: `multipart/form-data`

Form-data fields:
- category (Text)
- description (Text)
- location (Text)
- latitude (Text, optional)
- longitude (Text, optional)
- image (File, optional)

Image restrictions:
- JPG, PNG or WEBP
- Maximum size: 5 MB
- Only one image per complaint

## 3. Get All Complaints

- Method: GET
- Endpoint: `/api/complaints`

Returns all complaints stored in the database.

## 4. Get Complaint by Ticket ID

- Method: GET
- Endpoint: `/api/complaints/:ticketId`

Replace `:ticketId` with the actual ticket ID.

## 5. Update Complaint Status

- Method: PATCH
- Endpoint: `/api/complaints/:ticketId/status`

Request body:
```json
{
  "status": "In Progress"
}
```

Allowed statuses:
- Submitted
- Assigned
- In Progress
- Resolved

## 6. Backend Health Check

- Method: GET
- Endpoint: `/api/health`

Checks whether the backend server is running.

## Notes

- Backend runs on port 3000.
- SQLite is used for persistent complaint storage.
- Uploaded images are stored in the `uploads` folder.
- Image URL returned by the API can be accessed using the base URL followed by the image path.
-