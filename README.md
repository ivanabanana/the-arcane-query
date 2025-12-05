# the-arcane-query

This assignment was for the course Backend 1 at EC. The goal was to build an inventory management system using Node.js, Express, PostgreSQL and lightweight HTML/CSS/JS frontend. The focus was on using SQL relations, API, and building a small system.

## Table of Contents

- [The Assignment] (#the-assignment)
- [Tech Stack] (#tech-stack)
- [How to Run the Project] (#run-project)
- [API Endpoints] (#API)
- [Lessons Learned] (#lessons-learned)
- [Reflection] (#reflection)

## The Assignment

Du ska i denna uppgift bygga ett webbaserat lagerhanteringssystem (Inventory Management System) där användare kan hantera produkter i ett lager. Systemet ska byggas med Node.js och Express som backend, och använda PostgreSQL för lagring.

Produkter ska minst bestå av:
Namn
Antal (i lager)
Pris
Kategori (sträng eller enum)

API:et ska hantera följande endpoints:
GET /products för att hämta alla produkter
GET /products/:id för att hämta en specifik produkt
POST /products för att skapa en ny produkt
PUT /products/:id för att uppdatera en befintlig produkt
DELETE /products/:id för att ta bort en produkt

Vem som helst kan hantera produkter.

Följande behöver INTE finnas med:
Användare
Inlogg/registrering
Frontend (men bygg gärna en ändå om du vill och har tid)

Utökad beskrivning för VG

För att uppnå VG ska du även följa denna del.

Lägg till tabeller och endpoints för att hantera leverantörer. Med hjälp av SQL-relationer ska alla produkter kopplas till en leverantör. En leverantör ska innehålla:
Namn (på leverantör)
Kontaktperson
E-postadress
Telefonnummer
Land

Produkttabellen ska utökas med en relation till leverantörstabellen. När produkter hämtas (från /products endpoints) ska leverantörsinformation inkluderas genom användning av JOIN-queries.

API:et ska nu hantera följande endpoints också:
GET /suppliers för att hämta alla leverantörer
GET /suppliers/:id för att hämta en specifik leverantör (denna skall också returnera antalet produkter för leverantören, men inte produkterna i sig)
POST /suppliers för att skapa en ny leverantör
PUT /suppliers/:id för att uppdatera en befintlig leverantör
DELETE /suppliers/:id för att ta bort en leverantör
GET /suppliers/:id/products för att hämta alla produkter från en specifik leverantör

Vem som helst kan hantera leverantörer och produkter.

Du ska också hantera alla credentials genom en .env fil och inte hårdkoda några lösenord eller adresser. Detta inkluderar minst:
Server adress
Server port
Databas adress
Databas port
Databas namn
Databas lösenord

Bedömning

IG, G & VG

Om kraven för G eller VG inte uppnås bedöms uppgiften med IG.

Krav för G:
Använd git för versionshantering
Formatera koden (större misstag ger IG, fråga läraren om du blir osäker)
Följ instruktionerna i beskrivningen

Krav för VG:
Alla krav för G
Följ instruktionerna i den utökade beskrivningen
Redovisa projektet (mer information nedanför)

Redovisning

För att nå VG ska du redovisa ditt projekt inför klassen under den sista lektionen. Redovisningen skall hålla på i 5-15 minuter och innehålla:

1. Introduktion

- Vad har du skapat?

2. Planering

- Hur planerade du projektet?

3. Utförande

- Hur utförde du arbetet?
- Gick det som planerat?
- Vilka ändringar gjorde du under arbetets gång?

4. Resultat

- Visa resultatet av arbetet (projektet)

5. Lärdomar och svårigheter

- Vad har varit svårt?
- Vad har varit enkelt?
- Vad har du lärt dig angående arbetsmetoder, tekniker och mer?

## Tech Stack

### Backend

- Node.js
- Express.js
- Supabase (PostgreSQL)

### Frontend

- HTML
- CSS
- Vanilla JS

## How to Run the Project

**1. Install Dependencies**
`npm install`

**2. Create a .env file**

```
SUPABASE_URL=your-url
SUPABASE_KEY=your-service-role-key
PORT=3000

```

**3. Start backend**
`node server.js`

**4. Open frontend**
Open public/index.html

## API Endpoints

### Products

| Method | Endpoint      | Description                           |
| ------ | ------------- | ------------------------------------- |
| GET    | /products     | Get all products (with supplier join) |
| GET    | /products/:id | Get one product                       |
| POST   | /products     | Create a new product                  |
| PUT    | /products/:id | Update a product                      |
| DELETE | /products/:id | Delete a product                      |

### Suppliers

| Method | Endpoint                | Description                            |
| ------ | ----------------------- | -------------------------------------- |
| GET    | /suppliers              | Get all suppliers                      |
| GET    | /suppliers/:id          | Get one supplier + product count       |
| POST   | /suppliers              | Create a new supplier                  |
| PUT    | /suppliers/:id          | Update a supplier                      |
| DELETE | /suppliers/:id          | Remove supplier                        |
| GET    | /suppliers/:id/products | Get all products connected to supplier |

## Lessons Learned

**Backend /API**

- The difference between:
  ⋅⋅⋅⋅* Mount path (app.use("/products", router))
  ⋅⋅⋅⋅* Route path inside a file (router.get("/"))
- Learning and using Supabase for the first time.

**Testing (Postman)**

- How to test all CRUD operations using Postman
- Recognizing that routes must match how routers are mounted

**Frontend**

- Using defer in <script> to avoid DOM timing issues.
- Building dynamic dropdowns by fetching suppliers from backend.

## Reflection

This course was a mix of emotions for me. I feel like I've had to climb a mountain, yet I have barely reached the top. A lot of times there was trial and error, mostly errors, but I managed to solve it in the end.

In the future, I think I will create a dev-log.md to track my own progress and see how far I've gone between each step.
