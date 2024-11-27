-- Lieferanten Tabelle
CREATE TABLE Lieferanten (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ansprechpartner VARCHAR(100) NOT NULL,
    nummer VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL
);

-- Wareneingänge Tabelle
CREATE TABLE Wareneingaenge (
    id VARCHAR(36) PRIMARY KEY,
    lieferantId VARCHAR(36) NOT NULL,
    eingangsdatum DATE NOT NULL,
    erfassungsdatum DATETIME NOT NULL,
    chargennummer VARCHAR(20) NOT NULL,
    notizen TEXT,
    FOREIGN KEY (lieferantId) REFERENCES Lieferanten(id)
);

-- Dokumente Tabelle für Bild-URLs
CREATE TABLE Dokumente (
    id VARCHAR(36) PRIMARY KEY,
    wareneingangId VARCHAR(36) NOT NULL,
    dokumentTyp VARCHAR(20) NOT NULL, -- 'lieferschein' oder 'ware'
    url VARCHAR(500) NOT NULL,
    uploadDatum DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wareneingangId) REFERENCES Wareneingaenge(id)
);