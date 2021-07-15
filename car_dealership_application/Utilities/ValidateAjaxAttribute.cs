
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;
using System.Net;

namespace CarDealershipWebApp.Utilities
{
    public class ValidateAjaxAttribute : ActionFilterAttribute
    {
        // https://stackoverflow.com/a/14106135
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            string method = filterContext.HttpContext.Request.Method;

            string requestedWith = filterContext.HttpContext.Request.Headers["X-Requested-With"];

            // Source: http://www.binaryintellect.net/articles/f0fa64f6-d381-4f6d-835a-d7eb842b6288.aspx
            if (!(method == "POST" && requestedWith == "XMLHttpRequest"))
            {
                filterContext.HttpContext.Response.StatusCode = 405;
                return;
            }

            var modelState = filterContext.ModelState;
            
            if (!modelState.IsValid)
            {
                var errorModel =
                        from x in modelState.Keys
                        where modelState[x].Errors.Count > 0
                        select new
                        {
                            key = x,
                            errors = modelState[x].Errors.
                                                          Select(y => y.ErrorMessage).
                                                          ToArray()
                        };

                filterContext.Result = new JsonResult(new { Valid = false, Data = errorModel });

                // filterContext.HttpContext.Response.StatusCode = (int) HttpStatusCode.BadRequest;
            }
        }
    }
}
