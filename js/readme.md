-----------------
README
-----------------

REQUIREMENTS:
These files require the "node-crawler" package in order to run.

PURPOSE:
To extract data from various SMU web pages and store them dynamically into a table hosted on a MySQL database.

-----------------
SMU IN THE NEWS
-----------------

PURPOSE:
Extracts data from websites that extend from http://www.smu.edu.sg/news_room/smu_in_the_news. These are links that lead to news articles which featured SMU.

FILES INVOLVED:
1) spider.js
	This file extracts data from http://www.smu.edu.sg/news_room/smu_in_the_news/XXXX/index.asp, where XXXX represents a year (egs. 2008). On that webpage, up to 12 links are seen: one for every month of that particular year. Each links to a separate page. This file extracts these month/link pairs and stores them on a table named "archives".
2) month_spider.js
	This file first enters the table named "archive" to retrieve each and every link stored within that table. Each link connects to a web page with multiple other links. These links each have descriptions and connect to a PDF copy of the news article that SMU was featured in. This file captures all such information and saves them into a separate table named "month_archives".
3) copier.js
	This file downloads every PDF link retrieved in step 2 into a folder named "pdfs", also found within this folder.
	---NOTE--- Due to restraints, not all PDFs can be extracted as only a limited number of files can be done so.
	
USAGE:
The files MUST be run in the above order.

NOTES:
Links are stored under auto-incrementing IDs. Saving the same link in the table will create a duplicate entry instead of being rejected.

-----------------
SMU PRESS RELEASES
-----------------

PURPOSE:
Extracts data that extend from http://www.smu.edu.sg/news_room/press_releases. These are press statements released by SMU itself.

FILES INVOLVED:
1) press_crawler.js
	This file extracts data from http://www.smu.edu.sg/news_room/press_releases/XXXX/index.asp, where XXXX represents a year (egs. 2008). On that webpage, all press releases that the school has released in that year is seen; however, only the titles are seen, hyperlinked to the actual article. This file saves title/link pairs in a table named "archives_press".
2) press_crawler2.js
	This file first retrieves each and every link stored within the table named "archives_press" in the database, then accesses all the webpages to extract the data. The content of each article is stored in these links and this file extracts and saves them into the same table, "archives_press".

USAGE:
The files MUST be run in the above order.1) press_crawler.js

NOTES:
Links are stored under auto-incrementing IDs. Saving the same link in the table will create a duplicate entry instead of being rejected.

-----------------
SMU HIGHLIGHTS
-----------------

PURPOSE:
Extracts data that extend from http://www.smu.edu.sg/news_room/smu_highlights. These are news articles that SMU wishes to highlight.

FILES INVOLVED:
1) highlights_crawler.js
	This file extracts data from http://www.smu.edu.sg/news_room/. On that webpage, all highlights that the school has released in that year is seen; however, only the titles are seen, hyperlinked to the actual article. This file saves title/link pairs in a table named "archives_highlights".
2) highlights_crawler2.js
	This file first retrieves each and every link stored within the table named "archives_press" in the database, then accesses all the webpages to extract the data. The content of each article is stored in these links and this file extracts and saves them into the same table, "archives_highlights".
	
USAGE:
The files MUST be run in the above order.

NOTES:
Links are stored under auto-incrementing IDs. Saving the same link in the table will create a duplicate entry instead of being rejected.

-----------------
SCHOOL OF ACCOUNTANCY (SOA)
-----------------

PURPOSE:
Extracts data from the SOA webpage. These files extract faculty/staff data to be stored into a master table named "staff".

FILES INVOLVED:
1) spider_soa_faculty.js
	This file extracts data from http://www.accountancy.smu.edu.sg/faculty/accounting/index.asp. On this page, only a brief outline of all faculty members are shown. This file extracts the data, and also the link to more indepth data and stores them into the table.
	
2) spider_soa_faculty_indepth.js
	This file extracts data from each individual faculty member's page. "Indepth" links are taken from the table. The full details are captured and stored into the table, and each "indepth" link is converted to a NULL value in the table to prevent searches on that link accidentally taking place again.
	
3) spider_soa_staff.js
	This file extracts data from http://www.accountancy.smu.edu.sg/about_school/deanoffice.asp. In this page, staff and faculty members are mixed together. Staff do not have additional links, while faculty members do. It is therefore IMPORTANT that faculty is run BEFORE staff, as the faculty members already existing within the database will be noticed by the program and rejected from entering the table and being accidentally saved as a Staff member instead.
	
4) spider_soa_visiting_faculty.js
	This file extracts data from http://www.accountancy.smu.edu.sg/faculty/accounting/visiting/dsegal.asp. As there is only one entry on this page, it is uncertain whether or not this file can dynamically handle additional entries.
	
5) spider_soa_fds.js
	This file extracts data from http://www.accountancy.smu.edu.sg/faculty/accounting/fds.asp. This page only has one entry, however it is surmised that the program should work with additional entries as this is only the index page. The program captures the link for the single entry on the page, and details will be carried out in a later program.
	
6) spider_soa_fds_indepth.js
	This file retrieves all "indepth" links that are still existing in the table. At this juncture, there should ONLY be "indepth" links from spider_soa_fds.js existing. Please ensure this is the case by running this JavaScript file IMMEDIATELY AFTER spider_soa_fds.js. After extracting data from each "indepth" link, the links are set to NULL.

7) spider_soa_adjunct.js
	This file extracts data from http://www.accountancy.smu.edu.sg/faculty/accounting/adjunct/index.asp. This page contains multiple entries on adjunct faculties, however the data on this one page is brief, with links extending to more indepth-detailed pages. This file extracts these data/link pairs and saves them into the table named "staff".
	
8) spider_soa_adjunct_indepth.js
	This file retrieves all "indepth" links that are still existing in the table. At this juncture, there should ONLY be "indepth" links from spider_soa_adjunct.js existing. Please ensure this is the case by running this JavaScript file IMMEDIATELY after spider_soa_adjunct.js. After extracting data from each "indepth" link, the links are set to NULL.

USAGE:
Files 5&6 and 7&8 can be run interchangeably, just ensure that 6 is immediately after 5 and 8 is immediately after 7. To prevent confusion, it is highlight advised to simply run the files in this order.

NOTES:
Data is stored with EMAIL as the primary key. Duplicate entries being entered into the system are caught and rejected outright, not editing the original row.

-----------------
SCHOOL OF ECONOMICS (SOE)
-----------------

PURPOSE:
Extracts data from the SOE webpage. These files extract faculty/staff data to be stored into a master table named "staff".

FILES INVOLVED:
1) spider_soe_fulltime_faculty.js
	This file extracts data that extends from http://www.economics.smu.edu.sg/faculty/economics/index.asp. This page contains multiple entries on full-time faculties, however the data on this one page is brief, with links extending to more indepth-detailed pages. This file extracts these data/link pairs and saves them into the table named "staff".

2) spider_soe_fulltime_indepth.js
	This file retrieves all "indepth" links that are still existing in the table. At this juncture, there should ONLY be "indepth" links from spider_soe_fulltime_faculty.js existing. Please ensure this is the case by running this JavaScript file IMMEDIATELY after spider_soe_fulltime_faculty.js. After extracting data from each "indepth" link, the links are set to NULL.

3) spider_soe_visiting_profs.js
	This file extracts data that extends from http://www.economics.smu.edu.sg/faculty/visiting_professor/index.asp. This page contains multiple entries on professors that have visited SOE, however the data on this one page is brief, with links extending to more indepth-detailed pages. This file extracts these data/link pairs and saves them into the table named "staff". It must be noted that the page currently only contains information on professors who visited in 2012, it is unsure how the file will react to future updates.

4) spider_soe_adjunct_faculty.js
	This file extracts data that extends from http://www.economics.smu.edu.sg/faculty/adjuncts/index.asp. This page contains multiple entries on adjunct faculties, however the data on this one page is brief, with links extending to more indepth-detailed pages. This file extracts these data/link pairs and saves them into the table named "staff".

5) spider_soe_misc_indepth.js
	This file retrieves all "indepth" links that are still existing in the table. At this juncture, there should ONLY be "indepth" links from spider_soe_visiting_profs.js and spider_soe_adjunct_faculty.js existing. Please ensure this is the case by running this JavaScript file IMMEDIATELY after spider_soe_visiting_profs.js and spider_soe_adjunct_faculty.js. The two "indepth" link types are recorded together as the detailed pages follow the same format. After extracting data from each "indepth" link, the links are set to NULL.
	
6) spider_soe_visiting_faculty.js
	This file extracts data from http://www.economics.smu.edu.sg/faculty/visiting/XXXX.asp, where XXXX represents a year (egs. 2008). On each page, every faculty member that has visiting SOE in the corresponding year is displayed. As they do not have "indepth" pages, no further "indepth" JavaScript file is needed.

7) spider_soe_staff.js
	This file extracts data from http://www.economics.smu.edu.sg/about_school/staff.asp. In this page, staff and faculty members are mixed together. Staff do not have additional links, while faculty members do. It is therefore IMPORTANT that faculty is run BEFORE staff, as the faculty members already existing within the database will be noticed by the program and rejected from entering the table and being accidentally saved as a Staff member instead.
	
USAGE:
It is highly recommended that the files are run in the given order.

NOTES:
Data is stored with EMAIL as the primary key. Duplicate entries being entered into the system are caught and rejected outright, not editing the original row.
