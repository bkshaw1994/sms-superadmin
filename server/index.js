const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const TARGET_API_BASE_URL = process.env.TARGET_API_BASE_URL || "";

app.use(cors());
app.use(express.json());

function buildTargetUrl(path) {
  return `${TARGET_API_BASE_URL.replace(/\/$/, "")}${path}`;
}

async function parseProxyResponse(response) {
  const rawBody = await response.text();

  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return { message: rawBody };
  }
}

async function forwardRequest({ path, method, body, authorizationHeader }) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (authorizationHeader) {
    headers.Authorization = authorizationHeader;
  }

  const requestOptions = {
    method,
    headers,
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(buildTargetUrl(path), requestOptions);
  const responseBody = await parseProxyResponse(response);

  return {
    status: response.status,
    body: responseBody,
  };
}

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/auth/superadmin/login", async (request, response) => {
  const requestBody = request.body || {};
  const identifier =
    requestBody.username || requestBody.userName || requestBody.email || "";
  const password = requestBody.password || "";

  if (!identifier || !password) {
    return response
      .status(400)
      .json({ message: "Username/email and password are required." });
  }

  if (!TARGET_API_BASE_URL) {
    return response.json({
      token: "demo-superadmin-token",
      user: {
        username: identifier,
        name: identifier,
      },
    });
  }

  try {
    const result = await forwardRequest({
      path: "/auth/superadmin/login",
      method: "POST",
      body: {
        ...requestBody,
        username:
          requestBody.username || requestBody.userName || requestBody.email,
        userName:
          requestBody.userName || requestBody.username || requestBody.email,
        email:
          requestBody.email || requestBody.username || requestBody.userName,
        password,
      },
    });

    return response.status(result.status).json(result.body);
  } catch {
    return response
      .status(502)
      .json({ message: "Unable to reach upstream auth service." });
  }
});

app.get("/superadmin/schools", async (request, response) => {
  const authHeader = request.headers.authorization || "";

  if (!authHeader) {
    return response
      .status(401)
      .json({ message: "Authorization header is required." });
  }

  if (!TARGET_API_BASE_URL) {
    return response.json({
      schools: [
        { id: 1, name: "Green Valley Public School" },
        { id: 2, name: "Sunrise International Academy" },
        { id: 3, name: "Riverdale Senior Secondary School" },
      ],
    });
  }

  try {
    const result = await forwardRequest({
      path: "/superadmin/schools",
      method: "GET",
      authorizationHeader: authHeader,
    });

    return response.status(result.status).json(result.body);
  } catch {
    return response
      .status(502)
      .json({ message: "Unable to reach upstream schools service." });
  }
});

async function handleSchoolDetailsRequest({
  request,
  response,
  endpoint,
  mockResponse,
  failureMessage,
}) {
  const authHeader = request.headers.authorization || "";

  if (!authHeader) {
    return response
      .status(401)
      .json({ message: "Authorization header is required." });
  }

  if (!TARGET_API_BASE_URL) {
    return response.json(mockResponse);
  }

  try {
    const result = await forwardRequest({
      path: endpoint,
      method: "GET",
      authorizationHeader: authHeader,
    });

    return response.status(result.status).json(result.body);
  } catch {
    return response.status(502).json({ message: failureMessage });
  }
}

async function forwardGetWithFallback({ endpoints, authorizationHeader }) {
  let lastResult = null;

  for (const endpoint of endpoints) {
    const result = await forwardRequest({
      path: endpoint,
      method: "GET",
      authorizationHeader,
    });

    if (result.status >= 200 && result.status < 300) {
      return result;
    }

    lastResult = result;
  }

  return (
    lastResult || { status: 502, body: { message: "Upstream request failed." } }
  );
}

app.get(
  "/superadmin/schools/:schoolCode/students/classwise",
  async (request, response) => {
    const schoolCode = request.params.schoolCode;

    const authHeader = request.headers.authorization || "";

    if (!authHeader) {
      return response
        .status(401)
        .json({ message: "Authorization header is required." });
    }

    if (!TARGET_API_BASE_URL) {
      return response.json({
        students: [
          { class_name: "Class 1", section: "A", student_count: 34 },
          { class_name: "Class 2", section: "B", student_count: 29 },
          { class_name: "Class 10", section: "A", student_count: 41 },
        ],
      });
    }

    try {
      const encodedSchoolCode = encodeURIComponent(schoolCode);
      const result = await forwardGetWithFallback({
        authorizationHeader: authHeader,
        endpoints: [
          `/superadmin/schools/${encodedSchoolCode}/students/classwise`,
          `/superadmin/schools/${encodedSchoolCode}/students/class-wise`,
        ],
      });

      return response.status(result.status).json(result.body);
    } catch {
      return response
        .status(502)
        .json({
          message: "Unable to reach upstream class-wise students service.",
        });
    }
  },
);

app.get(
  "/superadmin/schools/:schoolCode/teachers",
  async (request, response) => {
    const schoolCode = request.params.schoolCode;

    return handleSchoolDetailsRequest({
      request,
      response,
      endpoint: `/superadmin/schools/${encodeURIComponent(schoolCode)}/teachers`,
      mockResponse: {
        teachers: [
          {
            name: "Aarav Sharma",
            email: "aarav@school.edu",
            phone: "9876500001",
          },
          {
            name: "Priya Iyer",
            email: "priya@school.edu",
            phone: "9876500002",
          },
        ],
      },
      failureMessage: "Unable to reach upstream teachers service.",
    });
  },
);

app.get(
  "/superadmin/schools/:schoolCode/parents",
  async (request, response) => {
    const schoolCode = request.params.schoolCode;

    return handleSchoolDetailsRequest({
      request,
      response,
      endpoint: `/superadmin/schools/${encodeURIComponent(schoolCode)}/parents`,
      mockResponse: {
        parents: [
          {
            name: "Rohit Verma",
            email: "rohit.parent@mail.com",
            phone: "9123400001",
          },
          {
            name: "Anita Rao",
            email: "anita.parent@mail.com",
            phone: "9123400002",
          },
        ],
      },
      failureMessage: "Unable to reach upstream parents service.",
    });
  },
);

app.get(
  "/superadmin/schools/:schoolCode/owners-itadmin",
  async (request, response) => {
    const schoolCode = request.params.schoolCode;

    return handleSchoolDetailsRequest({
      request,
      response,
      endpoint: `/superadmin/schools/${encodeURIComponent(schoolCode)}/owners-itadmin`,
      mockResponse: {
        ownersItadmin: [
          { name: "Karan Singh", role: "OWNER", email: "owner@school.edu" },
          { name: "Meera Das", role: "ITADMIN", email: "itadmin@school.edu" },
        ],
      },
      failureMessage: "Unable to reach upstream owner/itadmin service.",
    });
  },
);

app.listen(PORT, () => {
  console.log(`Express API listening on http://localhost:${PORT}`);
});
