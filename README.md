Smart Civic – Municipal Issue Reporting System



Backend



This repository contains the backend for the Smart Civic project, a municipal issue reporting system.



Technologies Used



\- Node.js

\- Express.js

\- SQLite

\- better-sqlite3

\- Multer



Features



\- Submit municipal complaints

\- Generate unique complaint ticket IDs

\- Store complaint details in SQLite

\- Upload complaint images

\- Retrieve all complaints

\- Retrieve complaints by ticket ID

\- Update complaint status



Setup Instructions



1\. Install Node.js.



2\. Clone this repository.



3\. Open the project folder in a terminal.



4\. Install the required packages:

&#x20;  

&#x20;  npm install



5\. Start the backend:

&#x20;  

&#x20;  node server.js



The backend runs at:



"http://localhost:3000"



API Endpoints



Method| Endpoint| Purpose

GET| "/api/health"| Check backend status

POST| "/api/complaints"| Submit a complaint

GET| "/api/complaints"| Retrieve all complaints

GET| "/api/complaints/:ticketId"| Retrieve complaint by ticket ID

PATCH| "/api/complaints/:ticketId/status"| Update complaint status



For request details, refer to "API\_DOCUMENTATION.md".



Image Upload



\- Supported formats: JPG, PNG, WEBP

\- Maximum file size: 5 MB

\- One image per complaint



Database



The SQLite database is created locally when the backend starts. The local database file is not included in the repository.

