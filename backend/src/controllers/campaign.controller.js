import * as campaignService from "../services/campaign.service.js";

export const create = async (req, res) => {
  try {
    const campaign = await campaignService.createCampaign(req.body);
    res.status(201).json(campaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAll = async (req, res) => {
  const campaigns = await campaignService.getAllCampaigns();
  res.json(campaigns);
};

export const getByName = async (req, res) => {
  try {
    const { name } = req.query;
    const campaign = await campaignService.getCampaignByName(name);
    res.json({ status: 'success', data: campaign });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const getOne = async (req, res) => {
  const campaign = await campaignService.getCampaignById(req.params.id);
  res.json(campaign);
};

export const update = async (req, res) => {
  const campaign = await campaignService.updateCampaign(
    req.params.id,
    req.body
  );
  res.json(campaign);
};

export const remove = async (req, res) => {
  await campaignService.deleteCampaign(req.params.id);
  res.json({ message: "Deleted" });
};

export const addLoss = async (req, res) => {
  try {
    console.log("Add Loss request for ID:", req.params.id, "quantity:", req.body.quantity);
    const result = await campaignService.addLosses(
      req.params.id,
      req.body.quantity
    );
    res.json(result);
  } catch (err) {
    console.error("Add Loss Error:", err.message);
    res.status(400).json({ message: err.message });
  }
};

export const addSale = async (req, res) => {
  try {
    console.log("Add Sale request for ID:", req.params.id, "quantity:", req.body.quantity);
    const result = await campaignService.addSales(
      req.params.id,
      req.body.quantity
    );
    res.json(result);
  } catch (err) {
    console.error("Add Sale Error:", err.message);
    res.status(400).json({ message: err.message });
  }
};

export const updateStatus = async (req, res) => {
  const result = await campaignService.changeStatus(
    req.params.id,
    req.body.status
  );
  res.json(result);
};