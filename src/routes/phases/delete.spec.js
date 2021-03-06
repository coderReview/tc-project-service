/* eslint-disable no-unused-expressions */
import _ from 'lodash';
import request from 'supertest';
import server from '../../app';
import models from '../../models';
import testUtil from '../../tests/util';

const body = {
  name: 'test project phase',
  status: 'active',
  startDate: '2018-05-15T00:00:00Z',
  endDate: '2018-05-15T12:00:00Z',
  budget: 20.0,
  progress: 1.23456,
  details: {
    message: 'This can be any json',
  },
  createdBy: 1,
  updatedBy: 1,
};

describe('Project Phases', () => {
  let projectId;
  let phaseId;
  before((done) => {
    // mocks
    testUtil.clearDb()
        .then(() => {
          models.Project.create({
            type: 'generic',
            billingAccountId: 1,
            name: 'test1',
            description: 'test project1',
            status: 'draft',
            details: {},
            createdBy: 1,
            updatedBy: 1,
          }).then((p) => {
            projectId = p.id;
            // create members
            models.ProjectMember.create({
              userId: 40051332,
              projectId,
              role: 'copilot',
              isPrimary: true,
              createdBy: 1,
              updatedBy: 1,
            }).then(() => {
              _.assign(body, { projectId });
              models.ProjectPhase.create(body).then((phase) => {
                phaseId = phase.id;
                done();
              });
            });
          });
        });
  });

  after((done) => {
    testUtil.clearDb(done);
  });

  describe('DELETE /projects/{projectId}/phases/{phaseId}', () => {
    it('should return 403 when user have no permission', (done) => {
      request(server)
        .delete(`/v4/projects/${projectId}/phases/${phaseId}`)
        .set({
          Authorization: `Bearer ${testUtil.jwts.member}`,
        })
        .expect('Content-Type', /json/)
        .expect(403, done);
    });

    it('should return 404 when no project with specific projectId', (done) => {
      request(server)
        .delete(`/v4/projects/999/phases/${phaseId}`)
        .set({
          Authorization: `Bearer ${testUtil.jwts.manager}`,
        })
        .expect('Content-Type', /json/)
        .expect(404, done);
    });

    it('should return 404 when no phase with specific phaseId', (done) => {
      request(server)
        .delete(`/v4/projects/${projectId}/phases/999`)
        .set({
          Authorization: `Bearer ${testUtil.jwts.manager}`,
        })
        .expect('Content-Type', /json/)
        .expect(404, done);
    });

    it('should return 204 when user have project permission', (done) => {
      request(server)
        .delete(`/v4/projects/${projectId}/phases/${phaseId}`)
        .set({
          Authorization: `Bearer ${testUtil.jwts.copilot}`,
        })
        .expect(204, done);
    });
  });
});
