/**
 * Navega a un tab del MainTabs desde cualquier pantalla anidada.
 */
export function navigateToMainTab(navigation, tabName, nestedParams) {
    let tabNav = navigation;

    while (tabNav?.getParent?.()) {
        const parent = tabNav.getParent();
        const state = parent?.getState?.();
        const routeNames = state?.routeNames ?? [];

        if (routeNames.includes(tabName)) {
            tabNav = parent;
            break;
        }

        tabNav = parent;
    }

    if (nestedParams) {
        tabNav.navigate(tabName, nestedParams);
        return;
    }

    tabNav.navigate(tabName);
}
