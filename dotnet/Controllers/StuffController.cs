using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WebApplication.Data;

namespace WebApplication.Controllers
{
    public class StuffController : Controller
    {
        private ApplicationDbContext _context;

        public StuffController(ApplicationDbContext context){
            _context = context;
        }

        public IActionResult Index()
        {
            return View(_context.Quotes.ToList());
        }

    }
}
