const express = require('express');
const { verifyJWT } = require('./subjects.helpers');
const { requireSubjectId, transformSubjectId } = require('./subjects.helpers');
const asyncHandler = require('express-async-handler');
const { controllerOnly } = require('./../../utils/middleware');

const {
  createDataShareValidator,
  removeDataShareValidator,
  shareDataShareValidator
} = require('./data-shares.validators');

const { 
  giveConsentValidator,
  updateConsentValidator,
  rectificationValidator,
  restrictionValidator 
} = require('./subjects.validators');

const router = express.Router();

const SubjectsController = require('./subjects.controller');
const subjectsController = new SubjectsController();

const DataShareController = require('./data-shares.controller');
const dataShareController = new DataShareController();

const ProcessorsController = require('./processors.controller');
const processorsController = new ProcessorsController();

module.exports = app => {
  // Not using router, because this is a publicly open endpoint (no need to verify JWT)
  // also needs to be registered before other routes under /subject, so don't reorder

  app.use('/subject', router);

  // UNSECURED ENDPOINTS

  router.get(
    '/processors',
    controllerOnly,
    asyncHandler(processorsController.getProcessors.bind(processorsController))
  );

  router.get(
    '/data-shares/share',
    shareDataShareValidator,
    asyncHandler(async (req, res) => dataShareController.share(req, res))
  );

  // JWT SECURED ENDPOINTS

  router.use(verifyJWT, requireSubjectId, transformSubjectId);

  router.post(
    '/give-consent',
    controllerOnly,
    giveConsentValidator,
    asyncHandler(async (req, res) => subjectsController.giveConsent(req, res))
  );

  router.post(
    '/update-consent',
    controllerOnly,
    updateConsentValidator,
    asyncHandler(async (req, res) => subjectsController.updateConsent(req, res))
  );

  router.get(
    '/access-data',
    asyncHandler(async (req, res) => subjectsController.requestDataAccess(req, res))
  );

  router.post(
    '/erase-data',
    controllerOnly,
    asyncHandler(async (req, res) => subjectsController.eraseData(req, res))
  );
  
  router.get(
    '/data-status',
    asyncHandler(async (req, res) => subjectsController.getPersonalDataStatus(req, res))
  );

  router.post(
    '/initiate-rectification',
    rectificationValidator,
    asyncHandler(async (req, res) => subjectsController.initiateRectification(req, res))
  );

  //Probably more endpoints should be controllerOnly
  //Also, it would be good to run a check on the interaction between the rights, such as erasing a subject and trying stuff when his data has been erased
  //Probably a manager should also be able to look into a subject's restrictions

  router.post(
    '/restrict',
    controllerOnly, 
    restrictionValidator,
    asyncHandler(async (req, res) => subjectsController.restrict(req, res))
  );

  router.get(
    '/get-restrictions',
    asyncHandler(async (req, res) => subjectsController.getRestrictions(req, res))
  );

  router.post(
    '/data-shares/:dataShareId/remove',
    removeDataShareValidator,
    asyncHandler(async (req, res) => dataShareController.removeDataShare(req, res))
  );

  router.post(
    '/data-shares/create',
    createDataShareValidator,
    asyncHandler(async (req, res) => dataShareController.createDataShare(req, res))
  );

  router.get(
    '/data-shares/list',
    asyncHandler(async (req, res) => dataShareController.getDataShares(req, res))
  );
};
