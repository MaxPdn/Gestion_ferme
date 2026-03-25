import Campaign from "../models/Campaign.model.js";

export const createCampaign = async (data) => {
  return await Campaign.create(data);
};

export const getAllCampaigns = async () => {
  return await Campaign.find()
    .populate("department", "name") // 🔥 clé
    .sort({ createdAt: -1 });
};

export const getCampaignById = async (id) => {
  return await Campaign.findById(id)
    .populate("department", "name");
};

export const getCampaignByName = async (name) => {
  if (!name) throw new Error("Name is required");
  return await Campaign.findOne({ name: new RegExp(`^${name}$`, 'i') })
    .populate("department", "name");
};

export const updateCampaign = async (id, data) => {
  return await Campaign.findByIdAndUpdate(id, data, { new: true });
};

export const deleteCampaign = async (id) => {
  return await Campaign.findByIdAndDelete(id);
};


export const addLosses = async (id, quantity) => {
  const campaign = await Campaign.findById(id);

  if (!campaign) throw new Error("Campaign not found");

  if (campaign.currentCount < quantity) {
    throw new Error("Not enough animals");
  }

  campaign.losses += quantity;
  campaign.currentCount -= quantity;

  await campaign.save();
  return campaign;
};

export const addSales = async (id, quantity) => {
  const campaign = await Campaign.findById(id);

  if (!campaign) throw new Error("Campaign not found");

  console.log(`AddSales: CurrentCount=${campaign.currentCount}, QuantityRequested=${quantity}`);

  if (campaign.currentCount < quantity) {
    throw new Error(`Not enough animals. Available: ${campaign.currentCount}, Requested: ${quantity}`);
  }

  campaign.sold += quantity;
  campaign.currentCount -= quantity;

  await campaign.save();
  return campaign;
};

export const changeStatus = async (id, status) => {
  return await Campaign.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
};