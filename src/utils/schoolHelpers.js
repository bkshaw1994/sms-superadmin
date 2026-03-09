export function schoolDisplayName(school) {
  return (
    school?.school_name ||
    school?.name ||
    school?.schoolName ||
    school?.title ||
    `School ${school?.id || ""}`.trim()
  );
}

export function schoolDisplayCode(school) {
  return school?.school_code || school?.schoolCode || school?.code || "N/A";
}

export function schoolCodeValue(school) {
  return school?.school_code || school?.schoolCode || school?.code || "";
}

export function schoolDisplayStatus(school) {
  return school?.status || "UNKNOWN";
}

export function schoolRouteId(school) {
  return (
    school?.school_code ||
    school?.schoolCode ||
    school?.code ||
    school?.school_id ||
    school?.id ||
    school?._id ||
    school?.schoolId ||
    ""
  );
}
