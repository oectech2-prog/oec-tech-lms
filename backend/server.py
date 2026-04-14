from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
import os
import logging

from database import init_storage, create_indexes, client
from routes.auth_routes import router as auth_router
from routes.course_routes import router as course_router
from routes.admin_routes import router as admin_router
from routes.general_routes import router as general_router
from routes.video_routes import router as video_router
from routes.expense_routes import router as expense_router

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="OEC Tech Institute API", docs_url="/api/docs", redoc_url=None)
api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(course_router)
api_router.include_router(admin_router)
api_router.include_router(general_router)
api_router.include_router(video_router)
api_router.include_router(expense_router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.warning(f"Storage init failed (non-critical): {e}")
    try:
        await create_indexes()
    except Exception as e:
        logger.warning(f"Index creation failed (non-critical): {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
