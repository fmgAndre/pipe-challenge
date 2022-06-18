import Koa from 'koa';
import Router from 'koa-router';
import { PrismaClient } from '@prisma/client';
import bodyParser from 'koa-bodyparser';

const prisma = new PrismaClient();

interface Org {
  org_name: string;
  daughters: Org[];
}

export const app = new Koa();
app.use(bodyParser());

const router = new Router();

router.get('/organisations', (ctx) => {
  ctx.body = 'Hello World';
});

function createRecursiveOrg(org: Org) {
  return !org.daughters
    ? { org_name: org.org_name }
    : {
        org_name: org.org_name,
        daughters: { create: org.daughters.map((d) => createRecursiveOrg(d)) },
      };
}

async function createOrg(org: Org) {
  const orgObj = await createRecursiveOrg(org)
  return prisma.org.create({
    data: orgObj
  })
}

router.post('/organisations', async (ctx) => {
  const body: Org = ctx.request.body;
  try {
    await prisma.org.deleteMany({});
    await createOrg(body);
    ctx.response.status = 201;
  } catch (e) {
    console.log(e);
    ctx.response.status = 500;
  }
});

app.use(router.routes());
