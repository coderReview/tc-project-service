
import _ from 'lodash';
import util from '../util';
import models from '../models';
import { USER_ROLE, PROJECT_MEMBER_ROLE } from '../constants';


/**
 * Super admin, Topcoder Managers are allowed to edit any project
 * Rest can add members only if they are currently part of the project team.
 * @param {Object}    req         the express request instance
 * @return {Promise}              Returns a promise
 */

module.exports = req => new Promise((resolve, reject) => {
  const projectId = _.parseInt(req.params.projectId);
  return models.ProjectMember.getActiveProjectMembers(projectId)
      .then((members) => {
        req.context = req.context || {};
        req.context.currentProjectMembers = members;
        const authMember = _.find(members, m => m.userId === req.authUser.userId);
        const prjMemberId = _.parseInt(req.params.id);
        const memberToBeRemoved = _.find(members, m => m.id === prjMemberId);
        // check if auth user has acecss to this project
        const hasAccess = util.hasRole(req, USER_ROLE.TOPCODER_ADMIN)
          || authMember && memberToBeRemoved && (
            authMember.role === PROJECT_MEMBER_ROLE.MANAGER
            || authMember.role === PROJECT_MEMBER_ROLE.CUSTOMER && authMember.isPrimary
              && memberToBeRemoved.role === PROJECT_MEMBER_ROLE.CUSTOMER
            || memberToBeRemoved.userId === req.authUser.userId);

        if (!hasAccess) {
          // user is not an admin nor is a registered project member
          return reject(new Error('You do not have permissions to perform this action'));
        }
        return resolve(true);
      });
});
