import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import mysql from 'mysql2/promise';

// Azure Storage konfiguration
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING || '');
export const containerClient = blobServiceClient.getContainerClient('wareneingangsdokumente');

// MySQL Datenbank Konfiguration
const dbConfig = {
  host: process.env.AZURE_SQL_SERVER,
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  database: process.env.AZURE_SQL_DATABASE,
  ssl: {
    rejectUnauthorized: true
  }
};

export const getDbConnection = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (err) {
    console.error('Datenbankverbindung fehlgeschlagen:', err);
    throw err;
  }
};