const SUPERSET_URL = "http://103.205.65.169:8088";

export async function getToken(username, password) {
  const res = await fetch(`${SUPERSET_URL}/api/v1/security/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username,
      password: password,
      provider: "db",
    }),
  });

  if (!res.ok) {
    throw new Error("Server error: " + res.status);
  }

  const data = await res.json();

  if (!data.access_token) {
    throw new Error("Invalid username or password.");
  }

  localStorage.setItem("superset_token", data.access_token);
  return data.access_token;
}

async function getStoredToken() {
  const stored = localStorage.getItem("superset_token");
  if (stored) return stored;

  const res = await fetch(`${SUPERSET_URL}/api/v1/security/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "dataman",
      password: "dataman",
      provider: "db",
    }),
  });

  const data = await res.json();
  localStorage.setItem("superset_token", data.access_token);
  return data.access_token;
}

export async function getChartData(chartId) {
  const token = await getStoredToken();

  const res = await fetch(`${SUPERSET_URL}/api/v1/chart/${chartId}/data/?force=true`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("superset_token");
    window.location.href = "/login";
    throw new Error("Token expired. Redirecting to login...");
  }

  if (!res.ok) {
    throw new Error("Chart data fetch failed: " + res.status);
  }

  const data = await res.json();
  return data.result[0].data;
}

export async function getDatasetData(sql) {
  const token = await getStoredToken();

  const res = await fetch(`${SUPERSET_URL}/api/v1/sqllab/execute/`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      database_id: 2,
      sql: sql,
      runAsync: false,
    }),
  });

  if (res.status === 401) {
    localStorage.removeItem("superset_token");
    window.location.href = "/login";
    throw new Error("Token expired. Redirecting to login...");
  }

  if (!res.ok) {
    throw new Error("Dataset fetch failed: " + res.status);
  }

  const data = await res.json();
  return data.data;
}
