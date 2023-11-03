const express = require('express');
const bodyParser = require('body-parser');
const { sequelize, Profile, Contract, Job } = require('./model');
const { Op, QueryTypes } = require('sequelize');
const {getProfile} = require('./middleware/getProfile')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * FIX ME!
 * @returns contract by id
 */
app.get('/api/v1/contracts/:id', getProfile, async (req, res) => {
    const { id } = req.params;
  
    try {
      const contract = await Contract.findOne({
        where: {
          id,
          [Op.or]: [
            { ClientId: req.profile.id },
            { ContractorId: req.profile.id },
          ],
        },
        include: Job, // includes associated jobs
      });
  
      if (contract) {
        return res.json(contract);
      } else {
        return res.status(404).end();
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
});
 
/**
 * 
 * @returns all non-terminated contracts
 */
app.get('/api/v1/contracts', getProfile, async (req, res) => {
    
    try {
      const contracts = await Contract.findAll({
        where: {
          [Op.or]: [
            { ClientId: req.profile.id },
            { ContractorId: req.profile.id },
          ],
          status: {
            [Op.not]: 'terminated', // Exclude terminated contracts
          },
        },
      });
  
      return res.json(contracts);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * 
 * @returns all unpaid jobs for a user
 */
app.get('/api/v1/jobs/unpaid', getProfile, async (req, res) => {
    try {
      const jobs = await Job.findAll({
        where: {
          ContractId: {
            [Op.in]: sequelize.literal(`
              (SELECT id FROM "Contracts" WHERE
                (ClientId = ${req.profile.id} OR ContractorId = ${req.profile.id}) AND
                status = 'in_progress')
            `),
          },
          [Op.or]: [
            { paid: null },   // Check for null
            { paid: false },  // Check for false
        ],
        },
      });
  
      return res.json(jobs);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
});
  
/**
 * 
 * @returns sucess on payment completed
 */
app.post('/api/v1/jobs/:job_id/pay', getProfile, async (req, res) => {
    const { job_id } = req.params;
  
    const transaction = await sequelize.transaction();
  
    try {
      const job = await Job.findByPk(job_id, {
        include: Contract,
        transaction, // Pass the transaction object to the query
      });
  
      if (!job) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Job not found' });
      }
  
      if (job.Contract.ClientId !== req.profile.id) {
        await transaction.rollback();
        return res.status(403).json({ error: 'Unauthorized to pay for this job' });
      }
  
      if (job.paid) {
        await transaction.rollback();
        return res.status(400).json({ error: 'This job has already been paid' });
      }
  
      if (req.profile.balance < job.price) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Insufficient balance' });
      }
  
      // Update balances and set the job as paid
      await Profile.update(
        {
          balance: sequelize.literal(`balance - ${job.price}`),
        },
        { where: { id: req.profile.id }, transaction }
      );
  
      await Profile.update(
        {
          balance: sequelize.literal(`balance + ${job.price}`),
        },
        { where: { id: job.Contract.ContractorId }, transaction }
      );
  
      await job.update({ paid: true, paymentDate: new Date() }, { transaction });
  
      // Commit the transaction if everything is successful
      await transaction.commit();
  
      return res.json({ message: 'Payment successful' });
    } catch (error) {
      // Rollback the transaction in case of any error
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });


/**
 * 
 * @returns sucess on deposit completed
 */
app.post('/api/v1/balances/deposit/:userId', getProfile, async (req, res) => {
    const { userId } = req.params;
    const depositAmount = parseFloat(req.body.amount);

    // Ensure that the authenticated user is a client
    if (req.profile.type !== 'client') {
        return res.status(403).json({ error: 'Only clients can make deposits' });
    }
  
    const transaction = await sequelize.transaction();
  
    try {
      if (!depositAmount || depositAmount <= 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Invalid deposit amount' });
      }
  
      const user = await Profile.findByPk(userId, { transaction });
  
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({ error: 'User not found' });
      }

      if (req.profile.id !== user.id) {
        return res.status(405).json({ error: 'Clients can make deposits only to their own accounts' });
      }
  
        // Find contracts associated with the client profile
        const contracts = await Contract.findAll({
            where: {
                ClientId: user.id,
            },
            transaction,
        });
    
        // Extract contract IDs
        const contractIds = contracts.map((contract) => contract.id);

        // Find unpaid jobs linked to the extracted contracts
        const totalJobsPaid = await Job.sum('price', {
            where: {
                ContractId: {
                    [Op.in]: contractIds,
                },
                [Op.or]: [
                    { paid: null },
                    { paid: false },
                ],
            },
            transaction,
        });
  
      const depositLimit = totalJobsPaid * 0.25;
  
      if (depositAmount > depositLimit) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Deposit exceeds the limit' });
      }
  
      // Update the user's balance with the deposited amount
      await user.update(
        {
          balance: sequelize.literal(`balance + ${depositAmount}`),
        },
        { transaction }
      );
  
      // Commit the transaction if everything is successful
      await transaction.commit();
  
      return res.json({ message: 'Deposit successful' });
    } catch (error) {
      // Rollback the transaction in case of any error
      await transaction.rollback();
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * 
 * @returns the best paid profession
 */
app.get('/api/v1/admin/best-profession', async (req, res) => {
    const { start, end } = req.query;
  
    try {
        const contracts = await Contract.findAll({
          where: {
            status: 'in_progress',
            createdAt: {
              [Op.between]: [start, end],
            },
          },
          include: [
            {
              model: Job,
              required: true,
            },
            {
              model: Profile,
              as: 'Contractor',
            },
          ],
        });
    
        const professionEarnings = contracts.reduce((result, contract) => {
          const profession = contract.Contractor.profession;
          const earned = contract.Jobs.reduce((total, job) => total + job.price, 0);
    
          if (!result[profession]) {
            result[profession] = 0;
          }
    
          result[profession] += earned;
    
          return result;
        }, {});
    
        const bestProfession = Object.keys(professionEarnings).reduce((best, profession) => {
          if (professionEarnings[profession] > professionEarnings[best]) {
            return profession;
          }
          return best;
        }, Object.keys(professionEarnings)[0]);
    
        return res.json({ profession: bestProfession, totalEarned: professionEarnings[bestProfession] });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
});
  
/**
 * 
 * @returns best paying clients
 */
app.get('/api/v1/admin/best-clients', async (req, res) => {
    const { start, end, limit = 2 } = req.query;
  
    try {
      const query = `
        SELECT
          p.id,
          p.firstName,
          p.lastName,
          SUM(j.price) as totalPaid
        FROM Profiles p
        INNER JOIN Contracts c ON c.ClientId = p.id
        INNER JOIN Jobs j ON j.ContractId = c.id
        WHERE j.paid = 1
          AND j.createdAt BETWEEN :start AND :end
        GROUP BY p.id, p.firstName, p.lastName
        ORDER BY totalPaid DESC
        LIMIT :limit
      `;
  
      const results = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { start, end, limit },
      });
  
      return res.json(results);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
});

  
module.exports = app;
