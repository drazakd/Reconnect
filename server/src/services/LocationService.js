import pool from "../config/db.js";

export const getAllCountries = async () => {
  const [rows] = await pool.query("SELECT DISTINCT pays FROM users ORDER BY pays ASC");
  return rows; // [{pays: 'Côte d''Ivoire'}, ...]
};

export const getCitiesByCountry = async (country) => {
  const [rows] = await pool.query("SELECT DISTINCT ville FROM users WHERE pays = ? ORDER BY ville ASC", [country]);
  return rows; // [{ville: 'Abidjan'}, ...]
};
