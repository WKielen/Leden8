export const ROLES = {
    BESTUUR: 'BS',
    JC: 'JC',
    TRAINER: 'TR',
    LEDENADMIN: 'LA',
    PENNINGMEESTER: 'PM',
    ADMIN: 'AD',
    TEST: 'TE',
};

export const PAGEROLES = {
    dashboardPageRoute: [ROLES.BESTUUR, ROLES.JC, ROLES.TRAINER, ROLES.LEDENADMIN, ROLES.PENNINGMEESTER, ROLES.ADMIN, ROLES.TEST],
    ledenPageRoles: [ROLES.ADMIN, ROLES.BESTUUR, ROLES.JC, ROLES.TRAINER],
    ledenmanagerPageRoles: [ROLES.ADMIN, ROLES.BESTUUR, ROLES.LEDENADMIN],
    mailPageRoles: [ROLES.ADMIN, ROLES.BESTUUR, ROLES.JC],
    agendaPageRoles: [ROLES.ADMIN, ROLES.BESTUUR, ROLES.JC],
    agendaManagerPageRoles: [ROLES.ADMIN, ROLES.BESTUUR, ROLES.JC],
    websitePageRoles: [ROLES.ADMIN, ROLES.BESTUUR, ROLES.JC],
    multiupdatePageRoles: [ROLES.ADMIN, ROLES.PENNINGMEESTER, ROLES.LEDENADMIN],
    downloadPageRoles: [ROLES.ADMIN, ROLES.BESTUUR, ROLES.JC],
    oudledenPageRoles: [ROLES.ADMIN, ROLES.BESTUUR, ROLES.LEDENADMIN],
    contrbedragenPageRoles: [ROLES.ADMIN, ROLES.PENNINGMEESTER],
    usersPageRoles: [ROLES.ADMIN, ROLES.BESTUUR],
    ladderPageRoles: [ROLES.ADMIN, ROLES.JC],
    syncnttbPageRoles: [ROLES.ADMIN, ROLES.LEDENADMIN],
    testPageRoles: [ROLES.TEST],
    trainingdeelnamePageRoles: [ROLES.TRAINER, ROLES.ADMIN, ROLES.BESTUUR,],
};

export const ROUTE = {
    dashboardPageRoute: 'dashboard',
    ledenPageRoute: 'leden',
    ledenmanagerPageRoute: 'ledenmanager',
    mailPageRoute: 'mail',
    agendaPageRoute: 'agenda',
    agendaManagerPageRoute: 'agendamanager',
    websitePageRoute: 'website',
    multiupdatePageRoute: 'multiupdate',
    downloadPageRoute: 'download',
    oudledenPageRoute: 'oudleden',
    contrbedragenPageRoute: 'contrbedragen',
    usersPageRoute: 'users',
    ladderPageRoute: 'ladder',
    syncnttbPageRoute: 'syncnttb',
    testPageRoute: 'test',
    trainingdeelnamePageRoute: 'trainingdeelname',
    trainingoverzichtPageRoute: 'trainingoverzicht',
    offlinePageRoute: 'offline',
    notAllowedPageRoute: 'notallowed',
    loginPageRoute: 'login'
};

//anotherfile.ts that refers to global constants
/*
import { GlobalVariable } from './path/global';

export class HeroService {
    private baseApiUrl = GlobalVariable.BASE_API_URL;

    //... more code
}
*/
