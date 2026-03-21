
<div align="center">

![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js_20-339933?style=for-the-badge\&logo=nodedotjs\&logoColor=white)
![Express.js](https://img.shields.io/badge/API-Express.js-000000?style=for-the-badge\&logo=express\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_15-4169E1?style=for-the-badge\&logo=postgresql\&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-black?style=for-the-badge\&logo=jsonwebtokens)
![Git](https://img.shields.io/badge/Version_Control-Git-F05032?style=for-the-badge\&logo=git\&logoColor=white)

<br>

![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![Project Type](https://img.shields.io/badge/Project-Academic-blue?style=flat-square)
![Architecture](https://img.shields.io/badge/Architecture-Clean_Architecture-orange?style=flat-square)
![Pattern](https://img.shields.io/badge/Pattern-Repository-purple?style=flat-square)

</div>

# 📦 StockFlow — Sistem i Menaxhimit të Inventarit

<p align="center">
  <strong>Një zgjidhje e avancuar web për menaxhimin e stokut në kohë reale, me shumë depo dhe inteligjencë artificiale për parashikimin e porosive.</strong>
</p>

<br>

📖 Përshkrimi i Projektit

StockFlow është një sistem i avancuar i menaxhimit të inventarit i ndërtuar si aplikacion web i plotë me React.js, Node.js dhe PostgreSQL. Sistemi është dizajnuar për biznese që operojnë me shumë depo dhe kërkojnë kontroll të saktë në kohë reale mbi mallrat, porositë dhe financat.

Sistemi mbulon ciklin e plotë të jetës së një produkti — nga furnizimi nga furnitorët, pranimi dhe ruajtja në depo, lëvizjet ndërmjet depove, deri te shitja tek klientët dhe gjenerimi i faturave dhe pagesave. Çdo veprim regjistrohet automatikisht përmes një sistemi auditimi. Sistemi mbështet multi-warehouse, kontroll stoku në nivel të detajuar, dhe njoftime automatike kur produktet bien nën nivelin minimal. Përfshin edhe një modul AI të quajtur Smart Restock Prediction që analizon historikun e shitjeve dhe sugjeron automatikisht kur dhe sa produkte duhet të porositen.

Sistemi ka role të ndryshme: Administrator, Menaxher dhe Staf, me akses të kontrolluar përmes JWT autentifikimit. Arkitektura ndjek Clean Architecture dhe Repository Pattern me 30 klasa të ndara në 5 module.

<br>

🛠 Teknologjitë e Përdorura

| Sektori            | Teknologjitë               |
| ------------------ | -------------------------- |
| 🎨 Frontend        | ⚛️ React · 🎨 Tailwind CSS |
| ⚙️ Backend         | 🟢 Node.js · ⚡ Express.js  |
| 🗄️ Database       | 🐘 PostgreSQL              |
| 🔧 Version Control | 🐙 Git                     |

<br>

✨ Funksionalitetet Kryesore

* 🔐 Autentifikim i Sigurt: JWT dhe 3 role të ndryshme (Admin, Menaxher, Staf)
* 📦 Menaxhim Produktesh: Menaxhim i detajuar me kategori, çmime dinamike dhe historik kostoje
* 🏢 Multi-Warehouse: Kontroll i saktë i stokut në shumë depo njëkohësisht
* 🔄 Lëvizjet e Stokut: Regjistrim i hyrjeve, daljeve, transfereve dhe rregullimeve manuale
* 📑 Menaxhim Furnitorësh dhe Porosish Blerje
* 💰 Menaxhim Shitjesh: Porosi, fatura dhe pagesa
* 🔔 Njoftime Automatike për stok minimal
* 🤖 Smart Restock Prediction
* 📊 Dashboard Interaktiv me statistika në kohë reale

<br>

🧱 Modulet e Sistemit

| Moduli          | Përshkrimi                              | Klasat Kryesore                                                   |
| :-------------- | :-------------------------------------- | :---------------------------------------------------------------- |
| Siguria         | Menaxhon autentifikimin dhe autorizimin | User, Role, AuthToken, AuditLog, Notification                     |
| Inventari       | Produkte dhe stok                       | Product, Category, Warehouse, WarehouseStock                      |
| Lëvizjet        | Lëvizjet e stokut                       | StockMovement, StockTransfer, TransferItem, StockAdjustment       |
| Financat        | Shitje dhe pagesa                       | Supplier, PurchaseOrder, SalesOrder, Invoice, Payment             |
| AI & Repository | Analitika dhe pattern                   | IRepository, FileRepository, ProductRepository, RestockPrediction |


👩‍💻 Autori

|              |                                                                  |
| :----------- | :--------------------------------------------------------------- |
| Emri         | Artiola Qollaku                                                  |
| Universiteti | Universiteti "Isa Boletini" — Mitrovicë                          |
| Fakulteti    | Fakulteti i Inxhinierisë Kompjuterike                            |
| Lënda        | Inxhinieri Softuerike                                            |
| GitHub       | [https://github.com/Artiola0406](https://github.com/Artiola0406) |
| Email        | [artiola.qollaku@umib.net](mailto:artiola.qollaku@umib.net)      |

<br>


© 2026 Artiola Qollaku. Ky projekt është krijuar për qëllime akademike si pjesë e lëndës Inxhinieri Softuerike. Të gjitha të drejtat e rezervuara.
