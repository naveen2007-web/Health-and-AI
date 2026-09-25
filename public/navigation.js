// ============================================================
// HEALTHPULSE - NAVIGATION FIX
// ============================================================

(function () {

    function initNavigation() {

        const app = document.getElementById("app");

        if (!app) {
            console.error("HealthPulse: #app not found.");
            return;
        }

        // Get all pages
        const pages = document.querySelectorAll(".page");

        // Get all sidebar navigation buttons
        const navButtons = document.querySelectorAll(".nav-item");

        console.log("HealthPulse navigation loaded.");
        console.log("Pages found:", pages.length);
        console.log("Navigation buttons found:", navButtons.length);


        // ----------------------------------------------------
        // SHOW PAGE
        // ----------------------------------------------------

        function openPage(pageName) {

            if (!pageName) {
                return;
            }

            console.log("Opening page:", pageName);


            // Hide ALL pages
            pages.forEach(function (page) {
                page.classList.remove("active");
                page.style.display = "none";
            });


            // Remove active state from ALL navigation buttons
            navButtons.forEach(function (button) {
                button.classList.remove("active");
            });


            // Find requested page
            const targetPage = document.getElementById(
                "page-" + pageName
            );


            if (!targetPage) {

                console.error(
                    "HealthPulse: Page not found:",
                    "page-" + pageName
                );

                return;
            }


            // Show requested page
            targetPage.classList.add("active");
            targetPage.style.display = "block";


            // Find corresponding navigation button
            const activeButton = document.querySelector(
                '.nav-item[data-page="' + pageName + '"]'
            );


            if (activeButton) {
                activeButton.classList.add("active");
            }


            // Update top title
            const pageTitle = document.getElementById("pageTitle");

            const pageSubtitle =
                document.getElementById("pageSubtitle");


            const pageInformation = {

                dashboard: {
                    title: "Dashboard",
                    subtitle: "Your health overview"
                },

                profile: {
                    title: "Profile & Health",
                    subtitle: "Manage your personal and health information"
                },

                nutrition: {
                    title: "Nutrition",
                    subtitle: "Track your daily nutrition"
                },

                activity: {
                    title: "Activity",
                    subtitle: "Track your physical activity"
                },

                medicines: {
                    title: "Medicine Reminder",
                    subtitle: "Manage your medication reminders"
                },

                history: {
                    title: "Health History",
                    subtitle: "Review your recorded measurements"
                },

                doctor: {
                    title: "Doctor Access",
                    subtitle: "Manage your healthcare access"
                }

            };


            if (pageInformation[pageName]) {

                if (pageTitle) {
                    pageTitle.textContent =
                        pageInformation[pageName].title;
                }

                if (pageSubtitle) {
                    pageSubtitle.textContent =
                        pageInformation[pageName].subtitle;
                }

            }


            // Close mobile sidebar
            const sidebar =
                document.getElementById("sidebar");

            const overlay =
                document.getElementById("sidebarOverlay");


            if (sidebar) {
                sidebar.classList.remove("open");
            }

            if (overlay) {
                overlay.classList.remove("visible");
                overlay.classList.remove("show");
            }


            // Scroll to top
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }


        // ----------------------------------------------------
        // NAVIGATION CLICK EVENTS
        // ----------------------------------------------------

        navButtons.forEach(function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    const pageName =
                        button.getAttribute("data-page");

                    console.log(
                        "Navigation clicked:",
                        pageName
                    );

                    openPage(pageName);

                }
            );

        });


        // ----------------------------------------------------
        // COMPLETE PROFILE BUTTON
        // ----------------------------------------------------

        const openProfileButton =
            document.getElementById("openProfileButton");

        if (openProfileButton) {

            openProfileButton.addEventListener(
                "click",
                function () {

                    openPage("profile");

                }
            );

        }


        // ----------------------------------------------------
        // MOBILE MENU
        // ----------------------------------------------------

        const mobileMenuButton =
            document.getElementById("mobileMenuButton");

        const sidebar =
            document.getElementById("sidebar");

        const sidebarOverlay =
            document.getElementById("sidebarOverlay");


        if (mobileMenuButton && sidebar) {

            mobileMenuButton.addEventListener(
                "click",
                function () {

                    sidebar.classList.toggle("open");

                    if (sidebarOverlay) {
                        sidebarOverlay.classList.toggle(
                            "visible"
                        );
                    }

                }
            );

        }


        if (sidebarOverlay && sidebar) {

            sidebarOverlay.addEventListener(
                "click",
                function () {

                    sidebar.classList.remove("open");

                    sidebarOverlay.classList.remove(
                        "visible"
                    );

                }
            );

        }


        // ----------------------------------------------------
        // START WITH DASHBOARD
        // ----------------------------------------------------

        openPage("dashboard");

    }


    // Run after HTML has loaded
    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initNavigation
        );

    } else {

        initNavigation();

    }

})();